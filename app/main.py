import os
import logging

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

# --- Validate API keys at startup ---
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GOOGLE_API_KEY or not GROQ_API_KEY:
    missing = []
    if not GOOGLE_API_KEY: missing.append("GOOGLE_API_KEY")
    if not GROQ_API_KEY: missing.append("GROQ_API_KEY")
    raise RuntimeError(
        f"Missing API keys: {', '.join(missing)}. "
        "Create a .env file with these keys."
    )

from app.rag_pipeline import RAGPipeline  # noqa: E402

app = FastAPI(
    title="RAG PDF Assistant",
    description="Upload PDFs and ask questions about their content using LangChain + FAISS + Google Gemini",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

rag = RAGPipeline()
logger.info("RAG Pipeline initialized successfully.")


# --- Request / Response models ---

class AskRequest(BaseModel):
    question: str
    top_k: int = 4


class AskResponse(BaseModel):
    answer: str
    risk_level: str
    sources: list[dict]
    num_docs_retrieved: int


# --- Routes ---

@app.get("/")
def root():
    """Health-check / status route."""
    return {"status": "ok", "message": "RAG PDF Assistant is running 🚀", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok", "index_loaded": rag.is_ready()}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload and index a PDF file."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        contents = await file.read()
        result = rag.ingest_pdf(contents, file.filename)
        logger.info("Indexed %s – %d chunks", file.filename, result["chunks"])
        return JSONResponse(content=result)
    except Exception as e:
        logger.exception("Failed to ingest PDF: %s", file.filename)
        raise HTTPException(status_code=500, detail=f"PDF ingestion failed: {e}") from e


@app.post("/ask", response_model=AskResponse)
def ask(request: AskRequest):
    """Ask a question against the indexed PDFs."""
    if not rag.is_ready():
        raise HTTPException(
            status_code=400,
            detail="No documents indexed yet. Please upload a PDF first.",
        )

    try:
        return rag.query(request.question, request.top_k)
    except Exception as e:
        logger.exception("Query failed")
        raise HTTPException(status_code=500, detail=f"Query failed: {e}") from e


@app.delete("/reset")
def reset_index():
    """Clear all indexed documents."""
    rag.reset()
    logger.info("Index cleared.")
    return {"message": "Index cleared successfully."}
