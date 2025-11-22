import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Local Knowledge Hub"
    API_V1_STR: str = "/api/v1"
    
    # Database
    CHROMA_DB_DIR: str = os.path.join(os.getcwd(), "chroma_db")
    SQLITE_URL: str = "sqlite:///./sql_app.db"

    # AI / LLM
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    DEFAULT_LLM_MODEL: str = "qwen2.5:7b"
    EMBEDDING_MODEL: str = "nomic-embed-text"

    class Config:
        env_file = ".env"

settings = Settings()
