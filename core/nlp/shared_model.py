# /Users/ashish/AANA/core/nlp/shared_model.py
import sys
sys.path.append('/Users/ashish/AANA/myenv/lib/python3.10/site-packages/')
import torch
from llama_cpp import Llama

device = torch.device("cpu")
print(f"[SharedModel] Using device: {device}")

class SharedModel:
    _model = None
    _device = device

    @classmethod
    def get_tokenizer(cls):
        return cls.get_model()

    @classmethod
    def get_model(cls):
        if cls._model is None:
            print("[SharedModel] Loading TinyLlama-1.1B-Chat-v1.0 GGUF model...")
            model_path = "/Users/ashish/AANA/models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
            cls._model = Llama(model_path=model_path, n_ctx=2048, n_threads=4, verbose=False)
            print("[SharedModel] TinyLlama model loaded successfully!")
        return cls._model

    @classmethod
    def get_device(cls):
        return cls._device

model = SharedModel.get_model()
device = SharedModel.get_device()

__all__ = ['SharedModel', 'model', 'device']