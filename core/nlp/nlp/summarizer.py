# /Users/ashish/AANA/core/nlp/nlp/summarizer.py
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class Summarizer:
    """
    Summarizer class for summarizing text using the shared TinyLlama model.
    """
    def __init__(self, tokenizer, model, device):
        self.tokenizer = tokenizer
        self.model = model
        self.device = device
        logger.info("[Summarizer] Using shared TinyLlama-1.1B model for text summarization.")

    def summarize_text(self, text, max_length=200):
        """Summarize text using the shared TinyLlama model."""
        logger.info("[Summarizer] Starting text summarization...")
        
        prompt = f"Summarize the following text concisely:\n\n{text}\n\nSummary:"
        output = self.model(
            prompt,
            max_tokens=max_length,
            temperature=0.7,
            stop=["\n"]
        )
        
        summary = output["choices"][0]["text"].strip()
        logger.info("[Summarizer] Text summarized successfully!")
        return summary