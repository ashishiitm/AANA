# /Users/ashish/AANA/core/nlp/eligibility_analyzer.py
import logging
from django.db import transaction
from django.db.utils import DataError
from core.models import Studies, StudyClassifications
from core.nlp.shared_model import SharedModel
from core.nlp.nlp.eligibility_analyzer_class import EligibilityAnalyzer

# =========================================
# Logging Configuration
# =========================================
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# =========================================
# Initialize Shared Resources
# =========================================
logger.info('[Initialization] Setting up shared model components...')
tokenizer = SharedModel.get_tokenizer()
model = SharedModel.get_model()
device = SharedModel.get_device()

# =========================================
# Initialize Eligibility Analyzer
# =========================================
logger.info('[Initialization] Setting up eligibility analyzer...')
eligibility_analyzer = EligibilityAnalyzer(tokenizer, model, device)
logger.info('[Initialization] Eligibility analyzer initialized successfully!')

# =========================================
# Eligibility Processing Logic
# =========================================
def process_eligibility(study):
    """
    Processes eligibility criteria for a single study and saves the result.
    """
    study_id = study['study_id']
    logger.info(f'[Processing] Starting eligibility analysis for study ID: {study_id}')

    try:
        # Analyze eligibility
        eligibility = eligibility_analyzer.analyze_eligibility(study['eligibility_criteria'])
        logger.info(f'[Eligibility Analysis] Study ID {study_id} - Result: {eligibility}')

        # Save to database
        try:
            with transaction.atomic():
                StudyClassifications.objects.create(
                    study_id=study_id,
                    eligibility=eligibility
                )
            logger.info(f'[Saving] Study ID {study_id} - Eligibility saved successfully!')
        except DataError as e:
            logger.warning(f'[DataError] Study ID {study_id} - Skipped due to data issue: {e}')
        except Exception as e:
            logger.error(f'[DB Error] Study ID {study_id} - Failed to save: {e}')

        return {
            'study_id': study_id,
            'eligibility': eligibility
        }

    except Exception as e:
        logger.error(f'[Error] Study ID {study_id} - Failed during eligibility analysis: {e}')
        return None

# =========================================
# Main Execution with Resume Capability
# =========================================
def process_eligibility_for_studies():
    """
    Processes eligibility criteria for all unprocessed studies.
    """
    processed_study_ids = set(StudyClassifications.objects.values_list('study_id', flat=True))
    studies = list(Studies.objects.exclude(study_id__in=processed_study_ids)
                  .values('study_id', 'eligibility_criteria'))
    
    logger.info(f'[Eligibility Pipeline] Found {len(studies)} unprocessed studies.')
    
    if not studies:
        logger.info('[Eligibility Pipeline] No new studies to process.')
        return

    for study in studies:
        result = process_eligibility(study)
        if result:
            logger.info(f'[Eligibility Pipeline] Processed study ID: {result["study_id"]}')
        else:
            logger.warning(f'[Eligibility Pipeline] Skipped study ID: {study["study_id"]} due to error.')

    logger.info('[Eligibility Pipeline] Processing completed!')

if __name__ == '__main__':
    process_eligibility_for_studies()