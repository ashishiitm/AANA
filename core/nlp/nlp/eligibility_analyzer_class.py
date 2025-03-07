# /Users/ashish/AANA/core/nlp/nlp/eligibility_analyzer_class.py
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class EligibilityAnalyzer:
    def __init__(self, tokenizer, model, device):
        self.tokenizer = tokenizer
        self.model = model
        self.device = device

    def analyze_eligibility(self, eligibility_text):
        """
        Analyzes eligibility criteria using the shared model.
        """
        logger.info("[EligibilityAnalyzer] Analyzing eligibility criteria...")
        prompt = f"Simplify and summarize eligibility criteria:\n\n{eligibility_text}\n\nResult:"
        output = self.model(
            prompt,
            max_tokens=100,
            temperature=0.7,
            stop=["\n"]
        )
        result = output["choices"][0]["text"].strip()
        logger.info("[EligibilityAnalyzer] Eligibility analysis completed.")
        return result