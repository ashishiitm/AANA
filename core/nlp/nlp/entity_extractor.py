# /Users/ashish/AANA/core/nlp/nlp/entity_extractor.py
from core.nlp.shared_model import SharedModel

class EntityExtractor:
    def __init__(self, tokenizer, model, device):
        self.tokenizer = tokenizer  # Explicitly accept tokenizer
        self.model = model          # Explicitly accept model
        self.device = device        # Explicitly accept device

    def extract_entities(self, text):
        prompt = f"Extract key entities (e.g., diseases, treatments) from:\n\n{text}\n\nEntities:"
        output = self.model(
            prompt,
            max_tokens=100,
            temperature=0.7,
            stop=["\n"]
        )
        entities_text = output["choices"][0]["text"].strip()
        return [entity.strip() for entity in entities_text.split(",")]

    def extract_entities_from_batch(self, text_list, batch_size=1):
        return [self.extract_entities(text) for text in text_list]