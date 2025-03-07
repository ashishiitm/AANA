# /Users/ashish/AANA/core/nlp/pipeline.py
from tqdm import tqdm
from django.db import transaction
from django.db.utils import DataError
from core.models import (
    Studies, StudyNlpInsights, StudyFAQs, StudyRecruitmentMessages,
    StudyClassifications, StudyReports
)
from core.nlp.preprocessing.text_preprocessor import TextPreprocessor
from core.nlp.shared_model import SharedModel
from core.nlp.nlp.entity_extractor import EntityExtractor
from core.nlp.nlp.simplifier import TextProcessor
from core.nlp.nlp.summarizer import Summarizer
from core.nlp.nlp.eligibility_analyzer_class import EligibilityAnalyzer
import logging
import json
from django.utils import timezone

# =========================================
# Logging Configuration
# =========================================
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# =========================================
# Initialize Shared Resources Once
# =========================================
logger.info('[Initialization] Setting up shared model components...')
tokenizer = SharedModel.get_tokenizer()
model = SharedModel.get_model()
device = SharedModel.get_device()

# =========================================
# Initialize NLP Components Once
# =========================================
logger.info('[Initialization] Setting up NLP components...')
preprocessor = TextPreprocessor()
entity_extractor = EntityExtractor(tokenizer, model, device)
eligibility_analyzer = EligibilityAnalyzer(tokenizer, model, device)
text_processor = TextProcessor(tokenizer=tokenizer, model=model, device=device)
summarizer = Summarizer(tokenizer=tokenizer, model=model, device=device)

logger.info('[Initialization] NLP components initialized successfully!')

# =========================================
# Utility Function to Truncate Text
# =========================================
def truncate_text(text, max_chars=4000):
    """Truncates text to fit within the model's context window."""
    if len(text) > max_chars:
        logger.warning(f"Text truncated from {len(text)} to {max_chars} characters to fit context window.")
        return text[:max_chars] + " [truncated]"
    return text

# =========================================
# Main Processing Logic
# =========================================
def process_single_study(study):
    """
    Processes a single study, skipping on failure and logging errors.
    Returns None only if processing fails entirely; otherwise, returns partial results.
    """
    study_id = study['study_id']
    logger.info(f'[Processing] Starting study ID: {study_id}')

    result = {'study_id': study_id}

    try:
        # Step 1: Preprocess text
        cleaned_summary = preprocessor.preprocess_text(study['brief_summary'])
        cleaned_summary = truncate_text(cleaned_summary)
        result['summary'] = cleaned_summary

        # Step 2: Extract entities
        entities = entity_extractor.extract_entities(cleaned_summary)
        result['key_entities'] = entities

        # Step 3: Analyze eligibility
        eligibility_criteria = truncate_text(study['eligibility_criteria'])
        eligibility = eligibility_analyzer.analyze_eligibility(eligibility_criteria)
        result['eligibility'] = eligibility

        # Step 4: Summarize text
        summary = summarizer.summarize_text(cleaned_summary)
        result['summary'] = summary  # Base summary

        # Step 5: Generate additional outputs
        simplified_summary = text_processor.simplify_text(cleaned_summary)
        faqs = text_processor.generate_faqs(cleaned_summary)
        category = text_processor.classify_trial(cleaned_summary)
        recruitment_message = text_processor.generate_recruitment_message(cleaned_summary)
        report = text_processor.generate_report(cleaned_summary)
        result.update({
            'simplified_summary': simplified_summary,
            'faqs': faqs,
            'category': category,
            'recruitment_message': recruitment_message,
            'report': report
        })

        # Step 6: Save to database with transaction
        try:
            with transaction.atomic():
                # Save to StudyNlpInsights
                StudyNlpInsights.objects.create(
                    study_id=study_id,
                    summary=summary,
                    key_entities=json.dumps(entities),
                    eligibility_analysis=eligibility,
                    created_at=timezone.now(),
                    simplified_summary=simplified_summary
                )
                # Save to StudyClassifications (matches schema)
                StudyClassifications.objects.create(
                    study_id=study_id,
                    category=category,
                    created_at=timezone.now()
                )
                # Save to StudyFAQs
                StudyFAQs.objects.create(
                    study_id=study_id,
                    faqs=faqs
                )
                # Save to StudyRecruitmentMessages
                StudyRecruitmentMessages.objects.create(
                    study_id=study_id,
                    message=recruitment_message
                )
                # Save to StudyReports
                StudyReports.objects.create(
                    study_id=study_id,
                    report=report
                )
            logger.info(f'[Processing] Study ID {study_id} saved successfully.')
        except DataError as e:
            logger.warning(f'[DataError] Study ID {study_id} skipped due to data issue: {e}')
        except Exception as e:
            logger.error(f'[DB Error] Study ID {study_id} failed to save: {e}')

        return result

    except Exception as e:
        logger.error(f'[Error] Study ID {study_id} failed during processing: {e}')
        return None if not result.get('key_entities') else result  # Return partial result if entities extracted

# =========================================
# Main Pipeline Execution with Resume Capability
# =========================================
def process_studies():
    """
    Processes all unprocessed studies sequentially, resuming from last successful save.
    """
    processed_study_ids = set(StudyNlpInsights.objects.values_list('study_id', flat=True))
    studies = list(Studies.objects.exclude(study_id__in=processed_study_ids)
                  .values('study_id', 'brief_summary', 'eligibility_criteria'))
    
    logger.info(f'[Pipeline] Found {len(studies)} unprocessed studies.')
    
    if not studies:
        logger.info('[Pipeline] No new studies to process.')
        return

    for study in tqdm(studies, desc='[Pipeline] Processing studies'):
        result = process_single_study(study)
        if result:
            logger.info(f'[Pipeline] Processed study ID: {result["study_id"]}')
        else:
            logger.warning(f'[Pipeline] Skipped study ID: {study["study_id"]} due to processing error.')

    logger.info('[Pipeline] Processing completed!')

if __name__ == '__main__':
    process_studies()