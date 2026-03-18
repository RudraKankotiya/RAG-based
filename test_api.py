"""
Tests for the RAG PDF Assistant API.
Run with: pytest test_api.py -v
"""
from unittest.mock import patch
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_health_no_index():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["index_loaded"] is False


def test_ask_without_upload():
    response = client.post("/ask", json={"question": "What is this about?"})
    assert response.status_code == 400
    assert "No documents indexed" in response.json()["detail"]


def test_upload_non_pdf():
    response = client.post(
        "/upload",
        files={"file": ("test.txt", b"hello world", "text/plain")},
    )
    assert response.status_code == 400
    assert "PDF" in response.json()["detail"]


def test_reset():
    response = client.delete("/reset")
    assert response.status_code == 200
    assert "cleared" in response.json()["message"]


@patch("app.rag_pipeline.RAGPipeline.ingest_pdf")
def test_upload_pdf_mock(mock_ingest):
    mock_ingest.return_value = {
        "filename": "test.pdf",
        "pages": 3,
        "chunks": 12,
        "total_files_indexed": 1,
    }
    fake_pdf = b"%PDF-1.4 fake pdf content"
    response = client.post(
        "/upload",
        files={"file": ("test.pdf", fake_pdf, "application/pdf")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "test.pdf"
    assert data["chunks"] == 12


@patch("app.rag_pipeline.RAGPipeline.is_ready", return_value=True)
@patch("app.rag_pipeline.RAGPipeline.query")
def test_ask_mock(mock_query, mock_ready):
    mock_query.return_value = {
        "answer": "The document discusses machine learning.",
        "sources": [{"source": "test.pdf", "page": 1, "snippet": "ML is..."}],
        "num_docs_retrieved": 1,
    }
    response = client.post("/ask", json={"question": "What is this about?"})
    assert response.status_code == 200
    assert "machine learning" in response.json()["answer"]
