import os
from typing import List
from fastapi import UploadFile
from pypdf import PdfReader
from docx import Document
import pandas as pd
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.core.database import get_collection
from app.services.llm_service import llm_service
import uuid

class IngestionService:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )

    async def process_file(self, file: UploadFile, hub_name: str):
        """
        Process an uploaded file: extract text, chunk it, embed it, and store in ChromaDB.
        """
        content = ""
        filename = file.filename
        file_ext = filename.split(".")[-1].lower()

        # Save file temporarily
        temp_path = f"/tmp/{filename}"
        with open(temp_path, "wb") as f:
            content_bytes = await file.read()
            f.write(content_bytes)

        try:
            if file_ext == "pdf":
                reader = PdfReader(temp_path)
                for page in reader.pages:
                    content += page.extract_text() + "\n"
            elif file_ext == "docx":
                doc = Document(temp_path)
                for para in doc.paragraphs:
                    content += para.text + "\n"
            elif file_ext == "txt":
                with open(temp_path, "r") as f:
                    content = f.read()
            elif file_ext in ["csv", "xlsx", "xls"]:
                if file_ext == "csv":
                    df = pd.read_csv(temp_path)
                else:
                    df = pd.read_excel(temp_path)
                content = df.to_string()
            else:
                return {"error": f"Unsupported file type: {file_ext}"}

            # Chunk text
            chunks = self.text_splitter.split_text(content)

            # Embed and Store
            collection = get_collection(hub_name)
            
            ids = [str(uuid.uuid4()) for _ in chunks]
            metadatas = [{"source": filename, "chunk_index": i} for i in range(len(chunks))]
            
            # Get embeddings (batching might be needed for large docs)
            # For simplicity, we'll loop or assume the service handles it.
            # Ideally, use a batch embedding function.
            embeddings = []
            for chunk in chunks:
                emb = llm_service.get_embeddings(chunk)
                if not emb:
                     # Fallback or error handling
                     pass
                embeddings.append(emb)

            # Filter out failed embeddings
            valid_data = [(id, chunk, meta, emb) for id, chunk, meta, emb in zip(ids, chunks, metadatas, embeddings) if emb]
            
            if valid_data:
                collection.add(
                    ids=[d[0] for d in valid_data],
                    documents=[d[1] for d in valid_data],
                    metadatas=[d[2] for d in valid_data],
                    embeddings=[d[3] for d in valid_data]
                )

            return {"message": f"Successfully processed {filename}", "chunks": len(valid_data)}

        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

ingestion_service = IngestionService()
