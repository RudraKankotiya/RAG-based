<div align="center">

<img src="https://raw.githubusercontent.com/github/explore/main/topics/python/python.png" width="60" alt="Python"/>

# RAG PDF Assistant

**Ask questions about any PDF — powered by LangChain, FAISS, and GPT-4o-mini**

[![Python](https://img.shields.io/badge/Python-3.11+-3776ab?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![LangChain](https://img.shields.io/badge/LangChain-0.3-1C3144?style=flat-square)](https://langchain.com)
[![FAISS](https://img.shields.io/badge/FAISS-local-FF6B6B?style=flat-square)](https://faiss.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Features](#-features) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [API Reference](#-api-reference) · [Deploy](#-deploy)

</div>

---

## What is this?

A **Retrieval-Augmented Generation (RAG)** backend that lets you upload PDFs and ask natural language questions about their content. Built with production patterns in mind — chunking strategy, MMR retrieval, source citation, and a clean REST API.

```
Upload a PDF  →  Chunk & Embed  →  Store in FAISS  →  Ask questions  →  Get cited answers
```

---

## ✨ Features

- 📄 **Multi-PDF support** — upload and query across multiple documents simultaneously
- 🧠 **MMR Retrieval** — Maximal Marginal Relevance ensures diverse, non-redundant context
- 📍 **Source citations** — every answer includes page number + snippet from the source PDF
- ⚡ **FAISS vector store** — blazing fast local similarity search, no cloud dependency
- 🔁 **Incremental indexing** — add new PDFs to a running index without re-processing old ones
- 🐳 **Docker ready** — single command deployment
- 🧪 **Tested** — pytest suite with mocked LLM calls

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FastAPI Server                      │
│                                                         │
│  POST /upload          POST /query       DELETE /reset  │
│       │                     │                           │
│       ▼                     ▼                           │
│  ┌─────────────────────────────────────┐                │
│  │           RAG Pipeline              │                │
│  │                                     │                │
│  │  PyPDFLoader → TextSplitter         │                │
│  │       ↓                             │                │
│  │  OpenAI Embeddings (3-small)        │                │
│  │       ↓                             │                │
│  │  FAISS Vector Store ←── merge()     │                │
│  │       ↓                             │                │
│  │  MMR Retriever (k=4, fetch_k=10)    │                │
│  │       ↓                             │                │
│  │  RetrievalQA + GPT-4o-mini          │                │
│  │       ↓                             │                │
│  │  Answer + Sources + Page Numbers    │                │
│  └─────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Choice | Why |
|---|---|---|
| Vector Store | FAISS (local) | Zero cost, no infra, fast enough for most PDFs |
| Retrieval Strategy | MMR | Reduces redundant chunks, better answer diversity |
| Chunk Size | 1000 tokens, 200 overlap | Balances context richness vs. noise |
| LLM | GPT-4o-mini | Cost-effective, fast, strong instruction following |
| Embeddings | text-embedding-3-small | Best cost/quality ratio from OpenAI |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/rag-pdf-assistant.git
cd rag-pdf-assistant

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt
```

### 2. Configure

```bash
cp .env.example .env
# Add your OpenAI API key to .env
```

```env
OPENAI_API_KEY=sk-...your-key-here...
```

### 3. Run

```bash
uvicorn app.main:app --reload
```

Server starts at `http://localhost:8000` · Swagger UI at `http://localhost:8000/docs`

---

## 📡 API Reference

### `POST /upload`
Upload and index a PDF file.

```bash
curl -X POST http://localhost:8000/upload \
  -F "file=@research_paper.pdf"
```

```json
{
  "filename": "research_paper.pdf",
  "pages": 12,
  "chunks": 48,
  "total_files_indexed": 1
}
```

---

### `POST /query`
Ask a question about the indexed documents.

```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the main conclusions?", "top_k": 4}'
```

```json
{
  "answer": "The paper concludes that transformer-based models outperform RNNs on long-range dependencies, achieving a 12% BLEU score improvement on WMT14...",
  "sources": [
    {
      "source": "research_paper.pdf",
      "page": 8,
      "snippet": "Our results demonstrate a consistent improvement across all benchmarks..."
    }
  ],
  "num_docs_retrieved": 4
}
```

---

### `GET /health`

```json
{ "status": "ok", "index_loaded": true }
```

### `DELETE /reset`
Clears all indexed documents and resets the FAISS store.

---

## 🐳 Deploy

### Docker

```bash
docker build -t rag-pdf-assistant .
docker run -p 8000:8000 --env-file .env rag-pdf-assistant
```

### Docker Compose

```bash
docker-compose up --build
```

---

## 🧪 Tests

```bash
pytest tests/ -v
```

Tests use mocked LLM/embedding calls — no API key required to run the test suite.

---

## 📁 Project Structure

```
rag-pdf-assistant/
├── app/
│   ├── __init__.py
│   ├── main.py            # FastAPI routes
│   └── rag_pipeline.py    # Core RAG logic
├── tests/
│   └── test_api.py        # Pytest suite
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

---

## 🔧 Customisation

**Swap the LLM** — edit `rag_pipeline.py`:
```python
# Use a local model via Ollama
from langchain_community.llms import Ollama
self.llm = Ollama(model="llama3")
```

**Persist the FAISS index** between restarts:
```python
# Save
self.vectorstore.save_local("faiss_index")

# Load
self.vectorstore = FAISS.load_local("faiss_index", self.embeddings)
```

**Add a re-ranker** for higher precision:
```python
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CohereRerank
```

---

## 📜 License

MIT — use freely, attribution appreciated.

---

<div align="center">
  Built with LangChain · FastAPI · FAISS · OpenAI
</div>
