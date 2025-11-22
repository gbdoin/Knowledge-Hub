import requests
import json
from typing import Generator, List, Dict, Any
from app.core.config import settings

class LLMService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.DEFAULT_LLM_MODEL

    def generate_response(self, prompt: str, context: List[str] = []) -> Generator[str, None, None]:
        """
        Generates a response from the LLM, optionally using context.
        """
        url = f"{self.base_url}/api/generate"
        
        # Construct prompt with context if available
        full_prompt = prompt
        if context:
            context_str = "\n".join(context)
            full_prompt = f"Context:\n{context_str}\n\nQuestion: {prompt}"

        payload = {
            "model": self.model,
            "prompt": full_prompt,
            "stream": True
        }

        try:
            with requests.post(url, json=payload, stream=True) as response:
                response.raise_for_status()
                for line in response.iter_lines():
                    if line:
                        body = json.loads(line)
                        if "response" in body:
                            yield body["response"]
        except requests.exceptions.RequestException as e:
            yield f"Error communicating with Ollama: {str(e)}"

    def get_embeddings(self, text: str) -> List[float]:
        """
        Generate embeddings for a given text using Ollama (or local HF model).
        For now, let's assume we use Ollama's embedding endpoint if available, 
        or we can switch to a local library like sentence-transformers later.
        """
        url = f"{self.base_url}/api/embeddings"
        payload = {
            "model": settings.EMBEDDING_MODEL, # Ensure this model is pulled in Ollama
            "prompt": text
        }
        
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            return response.json()["embedding"]
        except Exception as e:
            print(f"Error getting embeddings: {e}")
            return []

llm_service = LLMService()
