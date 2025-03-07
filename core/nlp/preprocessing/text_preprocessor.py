import re
import spacy

class TextPreprocessor:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")
        self.custom_stopwords = set([
            "study", "trial", "patients", "participants", "treatment", 
            "inclusion", "exclusion", "criteria", "placebo", "randomized"
        ])

    def preprocess_text(self, text):
        """Clean and preprocess text for NLP."""
        # Remove HTML tags
        text = re.sub(r"<.*?>", "", text)
        
        # Remove special characters and digits
        text = re.sub(r"[^a-zA-Z\s]", "", text)
        text = re.sub(r"\d+", "", text)

        # Convert to lowercase
        text = text.lower()

        # Tokenization and Lemmatization
        doc = self.nlp(text)
        tokens = [
            token.lemma_ 
            for token in doc 
            if not token.is_stop 
            and not token.is_punct 
            and token.lemma_ not in self.custom_stopwords
        ]

        # Join tokens back to string
        return " ".join(tokens)
