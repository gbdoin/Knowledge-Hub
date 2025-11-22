from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.services.ingestion import ingestion_service
from app.services.llm_service import llm_service
from app.core.database import get_collection, get_chroma_client

router = APIRouter()

class ChatRequest(BaseModel):
    hub_name: str
    message: str

class HubCreate(BaseModel):
    name: str

@router.post("/hubs")
def create_hub(hub: HubCreate):
    try:
        get_collection(hub.name)
        return {"message": f"Hub '{hub.name}' created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/hubs")
def list_hubs():
    client = get_chroma_client()
    collections = client.list_collections()
    return {"hubs": [c.name for c in collections]}

@router.post("/upload")
async def upload_file(
    hub_name: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        result = await ingestion_service.process_file(file, hub_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
def chat(request: ChatRequest):
    try:
        # 1. Retrieve context
        collection = get_collection(request.hub_name)
        
        # Generate embedding for query
        query_embedding = llm_service.get_embeddings(request.message)
        
        if not query_embedding:
             # Fallback if embedding fails
             return {"response": "Error generating embedding for query."}

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=3
        )
        
        context = results['documents'][0] if results['documents'] else []
        
        # 2. Generate response
        # We'll return a StreamingResponse ideally, but for now let's just return text
        # or use the generator.
        response_gen = llm_service.generate_response(request.message, context)
        
        # For simple API, let's join the response. 
        # In a real app, we'd use StreamingResponse.
        full_response = "".join(list(response_gen))
        
        return {"response": full_response, "context": context}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
