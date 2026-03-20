import os
import logging
import tempfile
from typing import Optional

from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = ChatPromptTemplate.from_template(
    "You are a helpful assistant that answers questions based strictly on the provided PDF content.\n\n"
    "Context from documents:\n{context}\n\n"
    "Question: {input}\n\n"
    "Instructions:\n"
    "- Answer based only on the context above.\n"
    "- If the answer is not in the context, say \"I couldn't find that in the uploaded documents.\"\n"
    "- Be concise and cite which part of the document supports your answer when possible.\n\n"
    "Answer:"
)

REFINER_PROMPT = ChatPromptTemplate.from_template(
    "You are an advanced AI assistant specialized in transforming structured retrieval outputs into natural, human-like, well-written explanations and sophisticated risk assessments.\n\n"
    "Instructions:\n"
    "1. DO NOT copy text directly from chunks.\n"
    "2. DO NOT mention \"chunks\", \"sources\", or \"documents\".\n"
    "3. DO NOT output bullet points unless explicitly asked.\n"
    "4. Combine all information into a SINGLE smooth paragraph.\n"
    "5. Maintain logical flow: Start with overall purpose, then describe key functionalities, end with expected outcome or goal.\n"
    "6. Categorize the risk of this situation as 'High', 'Medium', or 'Low' based on the content.\n"
    "7. Calculate an Anomaly Score (0-100) representing how unusual the shipment data is.\n"
    "8. Determine a Confidence Score (0-100) for your assessment.\n"
    "9. List 3-4 specific Reasoning Points for your risk classification.\n\n"
    "Input Data:\n"
    "Question: {question}\n"
    "Raw Answer: {answer}\n"
    "Retrieved Chunks content:\n{chunks}\n\n"
    "Return ONLY a JSON object in the following format:\n"
    "{{\n"
    "  \"answer\": \"The final paragraph...\",\n"
    "  \"risk_level\": \"High/Medium/Low\",\n"
    "  \"anomaly_score\": 85,\n"
    "  \"confidence_score\": 92,\n"
    "  \"reasoning_points\": [\"Reason 1\", \"Reason 2\", ...]\n"
    "}}\n"
    "Do not include any other text, markdown blocks, or explanations."
)


class RAGPipeline:
    """Encapsulates PDF ingestion, embedding, and RAG querying via Groq."""

    def __init__(self) -> None:
        self.vectorstore: Optional[FAISS] = None
        self.qa_chain = None
        self.refiner_chain = None
        self.indexed_files: list[str] = []

        google_key = os.getenv("GOOGLE_API_KEY")
        groq_key = os.getenv("GROQ_API_KEY")
        
        if not google_key or not groq_key:
            raise RuntimeError("Missing GOOGLE_API_KEY or GROQ_API_KEY.")

        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            google_api_key=google_key,
        )
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0,
            groq_api_key=groq_key,
        )
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ".", "!", "?", " ", ""],
        )
        logger.info("RAGPipeline ready (llm=llama-3.3-70b-versatile, embeddings=gemini-embedding-001)")

    def is_ready(self) -> bool:
        return self.vectorstore is not None

    def ingest_pdf(self, file_bytes: bytes, filename: str) -> dict:
        """Parse a PDF, chunk it, embed it, and add to FAISS index."""
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name

        try:
            loader = PyPDFLoader(tmp_path)
            documents = loader.load()

            for doc in documents:
                doc.metadata["source"] = filename

            chunks = self.splitter.split_documents(documents)

            if self.vectorstore is None:
                self.vectorstore = FAISS.from_documents(chunks, self.embeddings)
            else:
                new_store = FAISS.from_documents(chunks, self.embeddings)
                self.vectorstore.merge_from(new_store)

            self.indexed_files.append(filename)
            self._build_chain()

            return {
                "filename": filename,
                "pages": len(documents),
                "chunks": len(chunks),
                "total_files_indexed": len(self.indexed_files),
            }
        finally:
            os.unlink(tmp_path)

    def _build_chain(self) -> None:
        """Rebuild the QA chain after indexing."""
        retriever = self.vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={"k": 4, "fetch_k": 10},
        )
        # Modern way to create a retrieval chain
        combine_docs_chain = create_stuff_documents_chain(self.llm, SYSTEM_PROMPT)
        self.qa_chain = create_retrieval_chain(retriever, combine_docs_chain)
        
        # Build the refiner chain (just LLM + Prompt)
        self.refiner_chain = REFINER_PROMPT | self.llm

    def query(self, question: str, top_k: int = 4) -> dict:
        """Run a query through the RAG pipeline."""
        # 1. Step: Base Retrieval & Answer
        result = self.qa_chain.invoke({"input": question})
        raw_answer = result["answer"]
        context_docs = result.get("context", [])
        
        # 2. Step: Refinement and Risk Assessment
        chunks_text = "\n---\n".join([d.page_content for d in context_docs])
        refined_result = self.refiner_chain.invoke({
            "question": question,
            "answer": raw_answer,
            "chunks": chunks_text
        })
        
        # 3. Step: Extract and Format JSON
        import json
        content = refined_result.content if hasattr(refined_result, 'content') else str(refined_result)
        
        # Strip potential markdown code blocks
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        try:
            parsed = json.loads(content)
            final_answer = parsed.get("answer", content)
            risk_level = parsed.get("risk_level", "Medium")
            anomaly_score = parsed.get("anomaly_score", 50)
            confidence_score = parsed.get("confidence_score", 75)
            reasoning_points = parsed.get("reasoning_points", [])
        except:
            logger.warning("Failed to parse JSON from refiner, falling back to raw content.")
            final_answer = content
            risk_level = "Medium"
            anomaly_score = 50
            confidence_score = 75
            reasoning_points = []

        sources = []
        for doc in context_docs:
            sources.append({
                "source": doc.metadata.get("source", "unknown"),
                "page": doc.metadata.get("page", 0) + 1,
                "snippet": doc.page_content[:200] + "...",
            })

        return {
            "answer": final_answer.strip(),
            "risk_level": risk_level,
            "anomaly_score": anomaly_score,
            "confidence_score": confidence_score,
            "reasoning_points": reasoning_points,
            "sources": sources,
            "num_docs_retrieved": len(sources),
        }

    def reset(self) -> None:
        """Wipe the index."""
        self.vectorstore = None
        self.qa_chain = None
        self.indexed_files = []
        logger.info("Index reset.")
