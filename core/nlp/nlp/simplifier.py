# /Users/ashish/AANA/core/nlp/nlp/simplifier.py
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class TextProcessor:
    def __init__(self, tokenizer, model, device):
        self.tokenizer = tokenizer
        self.model = model
        self.device = device
        logger.info("[TextProcessor] Initialized with TinyLlama-1.1B model.")

    def generate(self, prompt, max_new_tokens=50, temperature=0.7):
        """Helper method to generate text using the shared model."""
        output = self.model(
            prompt,
            max_tokens=max_new_tokens,
            temperature=temperature,
            stop=["\n\n"]
        )
        return output["choices"][0]["text"].strip()

    def process_text(self, text):
        """Generic text processing method (used by pipeline)."""
        prompt = f"Process and simplify the following text:\n\n{text}\n\nResult:"
        return self.generate(prompt, max_new_tokens=150)

    def summarize_text(self, text):
        """Summarize text in one or two sentences."""
        prompt = f"Summarize the following clinical trial description in one or two sentences:\n\n{text}\n\nSummary:"
        return self.generate(prompt, max_new_tokens=100)

    def simplify_text(self, text):
        """Simplify text for a non-expert audience."""
        prompt = f"Simplify the following text for a non-expert audience:\n\n{text}\n\nSimplified version:"
        return self.generate(prompt, max_new_tokens=150)

    def generate_faqs(self, text):
        """Generate FAQs based on the text."""
        prompt = f"Generate frequently asked questions based on the following clinical trial description:\n\n{text}\n\nFAQs:"
        return self.generate(prompt, max_new_tokens=200)

    def classify_trial(self, text):
        """Classify the trial into a category."""
        prompt = f"Classify the following clinical trial into a category (e.g., disease, treatment, phase):\n\n{text}\n\nCategory:"
        return self.generate(prompt, max_new_tokens=50)

    def generate_recruitment_message(self, text):
        """Generate a recruitment message."""
        prompt = f"Generate a recruitment message for the following clinical trial:\n\n{text}\n\nRecruitment Message:"
        return self.generate(prompt, max_new_tokens=150)

    def generate_report(self, text):
        """Generate a brief report."""
        prompt = f"Generate a brief report summarizing the key points of the following clinical trial:\n\n{text}\n\nReport:"
        return self.generate(prompt, max_new_tokens=200)