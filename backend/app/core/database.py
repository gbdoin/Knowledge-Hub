import chromadb
from chromadb.config import Settings as ChromaSettings
from app.core.config import settings

def get_chroma_client():
    """
    Returns a persistent ChromaDB client.
    """
    client = chromadb.PersistentClient(path=settings.CHROMA_DB_DIR)
    return client

def get_collection(name: str):
    """
    Get or create a ChromaDB collection.
    """
    client = get_chroma_client()
    return client.get_or_create_collection(name=name)
