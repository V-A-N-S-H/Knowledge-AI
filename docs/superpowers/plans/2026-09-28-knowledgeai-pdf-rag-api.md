# KnowledgeAI PDF RAG API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a tested FastAPI service that indexes PDF page chunks and returns either cited, evidence-grounded answers or a clearly labelled Gemini fallback.

**Architecture:** API routers validate HTTP input and depend on focused services. PDF processing creates page-aware chunks; Gemini and Qdrant are hidden behind replaceable service interfaces so all behavior can be unit-tested without credentials. An authenticated Supabase user will later replace the fixed development owner, while the V1 service always uses that fixed owner server-side.

**Tech Stack:** Python 3.11+, FastAPI, Pydantic, PyMuPDF, Gemini API client, Qdrant client, Supabase Storage client, pytest, httpx.

**Spec:** `docs/superpowers/specs/2026-09-28-knowledgeai-pdf-rag-platform-design.md`

## Global Constraints

- V1 accepts PDFs only; do not imply support for arbitrary files, web search, reranking, or chat memory.
- The browser never receives Gemini, Qdrant, or server-side Supabase secrets.
- Use one backend-configured local development owner until verified Supabase JWT authentication is implemented.
- Preserve `user_id`, `document_id`, `filename`, `file_type`, `page`, `chunk_id`, and text provenance for every stored chunk.
- A document-mode answer requires affirmative evidence support, not similarity score alone.
- Treat retrieved text as untrusted evidence, never executable instructions.
- Use client-safe error responses for invalid files, provider outages, and rate limits.
- Unit tests use fakes; real-provider integration tests are opt-in through development environment variables.

## Review Focus

- A renamed executable or image presented as a PDF must be rejected after content-type inspection, not merely extension validation. Covered in Task 3.
- A scanned or textless PDF must fail as unreadable rather than create empty vectors. Covered in Task 3.
- Adjacent chunks must retain the correct page and overlap provenance. Covered in Task 4.
- Results from a different document or owner must never appear in retrieval. Covered in Task 7.
- A retrieved prompt-injection instruction must not make the system issue a document-mode answer without evidence. Covered in Task 8.

---

## Planned file structure

```text
backend/
  app/
    api/{health,documents,chat}.py
    core/{config,dependencies,errors}.py
    processors/{pdf_processor,chunker}.py
    schemas/{documents,chat,common}.py
    services/{storage,embeddings,generation,qdrant,documents,retrieval,answerability,rag}.py
    main.py
  tests/
    api/{test_health,test_documents,test_chat}.py
    processors/{test_pdf_processor,test_chunker}.py
    services/{test_documents,test_retrieval,test_answerability,test_rag}.py
    conftest.py
  pyproject.toml
  .env.example
  README.md
```

## Tasks

### Task 1: Backend foundation and health contract

**Files:**
- Create: `backend/pyproject.toml`
- Create: `backend/app/__init__.py`
- Create: `backend/app/main.py`
- Create: `backend/app/api/health.py`
- Create: `backend/app/core/config.py`
- Create: `backend/app/core/dependencies.py`
- Create: `backend/tests/conftest.py`
- Create: `backend/tests/api/test_health.py`
- Create: `backend/.env.example`
- Create: `backend/README.md`

**Interfaces:**
- Produces: `create_app() -> FastAPI`, `Settings`, `get_settings() -> Settings`, and `GET /health` returning `{"status": "healthy"}`.
- Produces: test app/client fixtures that later API tests import.

- [ ] **Step 1: Write the failing health API test**

```python
def test_health_returns_healthy(client: TestClient) -> None:
    assert client.get("/health").json() == {"status": "healthy"}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd backend && pytest tests/api/test_health.py::test_health_returns_healthy -v`

Expected: FAIL because no test configuration or FastAPI application exists.

- [ ] **Step 3: Add the minimal application scaffold**

Define `create_app() -> FastAPI` in `app/main.py`, register the health router, and use it as the module-level `app`. Add settings for environment, fixed `development_owner_id`, upload byte limit, Gemini credentials, Qdrant credentials, and Supabase credentials; do not provide real values in `.env.example`.

- [ ] **Step 4: Run the health test to verify it passes**

Run: `cd backend && pytest tests/api/test_health.py::test_health_returns_healthy -v`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend
git commit -m "feat: add FastAPI health foundation"
```

### Task 2: Shared schemas and client-safe error responses

**Files:**
- Create: `backend/app/schemas/common.py`
- Create: `backend/app/schemas/documents.py`
- Create: `backend/app/schemas/chat.py`
- Create: `backend/app/core/errors.py`
- Modify: `backend/app/main.py`
- Test: `backend/tests/api/test_health.py`

**Interfaces:**
- Consumes: `create_app() -> FastAPI` from Task 1.
- Produces: `SourceCitation`, `ChatResponse`, `UploadResponse`, `AppError`, and an exception handler that returns `{"detail": "client-safe message"}`.

- [ ] **Step 1: Write failing tests for public response serialization and safe errors**

```python
def test_chat_response_requires_no_sources_for_fallback() -> None:
    response = ChatResponse(mode="fallback", answer="Answer", notice="Not found", sources=[])
    assert response.mode == "fallback"

def test_app_error_hides_internal_detail(client: TestClient) -> None:
    response = client.get("/health?force_error=true")
    assert "secret" not in response.text
```

- [ ] **Step 2: Run the new tests to verify they fail**

Run: `cd backend && pytest tests/api/test_health.py -v`

Expected: FAIL because schemas and error handling do not exist.

- [ ] **Step 3: Implement shared models and error handling**

Define `ChatMode = Literal["document", "fallback"]`; define `ChatResponse(mode, answer, notice, sources)` and `SourceCitation(filename, page)`. Make `AppError(status_code: int, public_message: str)` the only exception type routers intentionally expose, and install its handler in `create_app()`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd backend && pytest tests/api/test_health.py -v`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend
git commit -m "feat: add API response and error contracts"
```

### Task 3: PDF validation and page-aware text extraction

**Files:**
- Create: `backend/app/processors/pdf_processor.py`
- Create: `backend/app/utils/file_validation.py`
- Create: `backend/tests/processors/test_pdf_processor.py`
- Create: `backend/tests/utils/test_file_validation.py`

**Interfaces:**
- Produces: `validate_pdf(filename: str, content_type: str | None, content: bytes, max_bytes: int) -> None`.
- Produces: `extract_pdf_pages(content: bytes, filename: str) -> list[ExtractedPage]`, where `ExtractedPage` contains `text: str`, `filename: str`, and one-based `page: int`.
- Raises: `AppError` with client-safe messages for invalid, oversized, corrupt, or textless PDFs.

- [ ] **Step 1: Write failing validation and extraction tests**

```python
def test_extract_pdf_pages_preserves_text_and_page_number(sample_pdf: bytes) -> None:
    pages = extract_pdf_pages(sample_pdf, "report.pdf")
    assert [(page.page, page.text) for page in pages] == [(1, "Revenue: 125"), (2, "Cost: 80")]

def test_validate_pdf_rejects_non_pdf_content_named_pdf() -> None:
    with pytest.raises(AppError, match="valid PDF"):
        validate_pdf("report.pdf", "application/pdf", b"not a PDF", 1_000_000)
```

- [ ] **Step 2: Run the processor tests to verify they fail**

Run: `cd backend && pytest tests/processors/test_pdf_processor.py tests/utils/test_file_validation.py -v`

Expected: FAIL because validation and extraction functions do not exist.

- [ ] **Step 3: Implement validation and extraction**

Use PDF signature and parser validation in addition to filename/MIME checks. Open bytes with PyMuPDF, extract text page by page, trim only whitespace, and raise an `AppError` when no meaningful text can be extracted from the entire file. Provide test fixtures that generate the two-page PDF in memory.

- [ ] **Step 4: Run the processor tests to verify they pass**

Run: `cd backend && pytest tests/processors/test_pdf_processor.py tests/utils/test_file_validation.py -v`

Expected: PASS, including oversized, corrupt, non-PDF, and textless-PDF cases.

- [ ] **Step 5: Commit**

```bash
git add backend
git commit -m "feat: validate and extract PDF pages"
```

### Task 4: Provenance-preserving chunking

**Files:**
- Create: `backend/app/processors/chunker.py`
- Create: `backend/tests/processors/test_chunker.py`

**Interfaces:**
- Consumes: `list[ExtractedPage]` from Task 3.
- Produces: `chunk_pages(pages: list[ExtractedPage], chunk_size: int, overlap: int) -> list[DocumentChunk]`.
- Produces: `DocumentChunk(text, filename, page, chunk_id, file_type="pdf")` with deterministic chunk IDs in input order.

- [ ] **Step 1: Write the failing chunker tests**

```python
def test_chunk_pages_preserves_page_and_overlap() -> None:
    chunks = chunk_pages([ExtractedPage(text="one two three four", filename="r.pdf", page=2)], 3, 1)
    assert [(chunk.page, chunk.text) for chunk in chunks] == [(2, "one two three"), (2, "three four")]
```

- [ ] **Step 2: Run the chunker tests to verify they fail**

Run: `cd backend && pytest tests/processors/test_chunker.py -v`

Expected: FAIL because `chunk_pages` is undefined.

- [ ] **Step 3: Implement `chunk_pages`**

Split normalized text on whitespace into fixed word windows for V1. Validate `chunk_size > 0` and `0 <= overlap < chunk_size`; do not combine content from different pages, and skip whitespace-only pages.

- [ ] **Step 4: Run the chunker tests to verify they pass**

Run: `cd backend && pytest tests/processors/test_chunker.py -v`

Expected: PASS, including invalid settings and cross-page provenance cases.

- [ ] **Step 5: Commit**

```bash
git add backend
git commit -m "feat: add page-aware document chunking"
```

### Task 5: External-service ports and development adapters

**Files:**
- Create: `backend/app/services/embeddings.py`
- Create: `backend/app/services/generation.py`
- Create: `backend/app/services/qdrant.py`
- Create: `backend/app/services/storage.py`
- Create: `backend/tests/services/test_embeddings.py`
- Create: `backend/tests/services/test_generation.py`
- Create: `backend/tests/services/test_qdrant.py`
- Create: `backend/tests/services/test_storage.py`

**Interfaces:**
- Produces: `EmbeddingService.embed_documents(texts: list[str]) -> list[list[float]]` and `EmbeddingService.embed_query(text: str) -> list[float]`.
- Produces: `build_support_prompt(question: str, evidence: list[RetrievedChunk]) -> str`, `GenerationService.classify_support(question: str, evidence: list[RetrievedChunk]) -> bool`, `GenerationService.answer_from_evidence(question: str, evidence: list[RetrievedChunk]) -> str`, and `GenerationService.answer_from_general_knowledge(question: str) -> str`.
- Produces: `VectorStore.upsert(chunks: list[StoredChunk]) -> None` and `VectorStore.search(query_vector: list[float], user_id: str, document_ids: list[str], limit: int) -> list[RetrievedChunk]`.
- Produces: `FileStorage.save_pdf(document_id: str, filename: str, content: bytes) -> str`.

- [ ] **Step 1: Write failing fake-backed contract tests**

```python
def test_search_passes_owner_and_document_filters_to_vector_store(fake_qdrant: FakeQdrant) -> None:
    store.search([0.1], user_id="local-owner", document_ids=["doc-1"], limit=3)
    assert fake_qdrant.filter == {"user_id": "local-owner", "document_ids": ["doc-1"]}
```

- [ ] **Step 2: Run the service contract tests to verify they fail**

Run: `cd backend && pytest tests/services/test_embeddings.py tests/services/test_generation.py tests/services/test_qdrant.py tests/services/test_storage.py -v`

Expected: FAIL because service ports and adapters do not exist.

- [ ] **Step 3: Implement narrow provider adapters**

Use Gemini only inside `embeddings.py` and `generation.py`, Qdrant only inside `qdrant.py`, and Supabase Storage only inside `storage.py`. In `generation.py`, build evidence-only prompts that state retrieved text is untrusted evidence rather than instructions. Map provider failures into `AppError` categories for rate limiting, timeouts, and unavailability. Make all client construction dependency-injectable so tests use fakes and no network calls.

- [ ] **Step 4: Run the service contract tests to verify they pass**

Run: `cd backend && pytest tests/services/test_embeddings.py tests/services/test_generation.py tests/services/test_qdrant.py tests/services/test_storage.py -v`

Expected: PASS without real credentials or network traffic.

- [ ] **Step 5: Commit**

```bash
git add backend
git commit -m "feat: add external service adapters"
```

### Task 6: PDF ingestion orchestration and upload API

**Files:**
- Create: `backend/app/services/documents.py`
- Create: `backend/app/api/documents.py`
- Modify: `backend/app/main.py`
- Create: `backend/tests/services/test_documents.py`
- Create: `backend/tests/api/test_documents.py`

**Interfaces:**
- Consumes: PDF processing from Tasks 3-4 and service ports from Task 5.
- Produces: `DocumentService.ingest_pdf(filename: str, content_type: str | None, content: bytes) -> UploadResponse`.
- Produces: `POST /documents/upload` accepting one PDF multipart upload and returning `UploadResponse(document_id, filename, chunk_count, status="ready")`.

- [ ] **Step 1: Write failing ingestion and upload tests**

```python
def test_ingest_pdf_stores_page_chunks_with_development_owner(services: FakeServices, sample_pdf: bytes) -> None:
    response = service.ingest_pdf("report.pdf", "application/pdf", sample_pdf)
    assert services.vectors.chunks[0].user_id == "local-development-owner"
    assert response.chunk_count == len(services.vectors.chunks)
```

- [ ] **Step 2: Run ingestion tests to verify they fail**

Run: `cd backend && pytest tests/services/test_documents.py tests/api/test_documents.py -v`

Expected: FAIL because `DocumentService` and upload route do not exist.

- [ ] **Step 3: Implement ingestion orchestration**

Generate a server-side UUID document ID, validate before storing, save the original, extract and chunk content, embed batch text, then upsert chunk payloads. Reject an upload when no chunks result. Register the documents router and translate multipart validation failures into client-safe errors.

- [ ] **Step 4: Run ingestion tests to verify they pass**

Run: `cd backend && pytest tests/services/test_documents.py tests/api/test_documents.py -v`

Expected: PASS, including rejected invalid uploads and page metadata checks.

- [ ] **Step 5: Commit**

```bash
git add backend
git commit -m "feat: add PDF upload and indexing"
```

### Task 7: Scoped semantic retrieval

**Files:**
- Create: `backend/app/services/retrieval.py`
- Create: `backend/tests/services/test_retrieval.py`

**Interfaces:**
- Consumes: `EmbeddingService.embed_query` and `VectorStore.search` from Task 5.
- Produces: `RetrievalService.retrieve(question: str, document_ids: list[str], limit: int = 5) -> list[RetrievedChunk]`.
- Guarantees: uses the configured development owner and passes only requested document IDs to the vector-store filter.

- [ ] **Step 1: Write failing retrieval-scope tests**

```python
def test_retrieve_uses_configured_owner_and_requested_documents(fake_store: FakeVectorStore) -> None:
    service.retrieve("What is revenue?", ["doc-1"])
    assert fake_store.last_user_id == "local-development-owner"
    assert fake_store.last_document_ids == ["doc-1"]
```

- [ ] **Step 2: Run the retrieval tests to verify they fail**

Run: `cd backend && pytest tests/services/test_retrieval.py -v`

Expected: FAIL because `RetrievalService` is undefined.

- [ ] **Step 3: Implement `RetrievalService.retrieve`**

Reject an empty question or empty document list with `AppError`. Embed the question once, pass the configured owner and requested IDs to the vector store, and return retrieved chunks in provider score order without inventing citations.

- [ ] **Step 4: Run the retrieval tests to verify they pass**

Run: `cd backend && pytest tests/services/test_retrieval.py -v`

Expected: PASS, including no cross-owner/document results and empty-result behavior.

- [ ] **Step 5: Commit**

```bash
git add backend
git commit -m "feat: add scoped semantic retrieval"
```

### Task 8: Evidence-only answerability and RAG orchestration

**Files:**
- Create: `backend/app/services/answerability.py`
- Create: `backend/app/services/rag.py`
- Create: `backend/tests/services/test_answerability.py`
- Create: `backend/tests/services/test_rag.py`

**Interfaces:**
- Consumes: `RetrievedChunk` from Task 7 and `GenerationService` from Task 5.
- Produces: `RagService.answer(message: str, document_ids: list[str]) -> ChatResponse`.
- Guarantees: document-mode sources are derived from retrieved chunks; unsupported evidence returns fallback mode and no sources.

- [ ] **Step 1: Write failing supported, unsupported, and injection-resistance tests**

```python
def test_unsupported_question_returns_labelled_fallback(fake_generation: FakeGeneration) -> None:
    fake_generation.supported = False
    response = service.answer("Who is the CEO?", ["doc-1"])
    assert (response.mode, response.notice, response.sources) == ("fallback", "This information was not found in your uploaded data.", [])

def test_document_instruction_does_not_override_evidence_policy() -> None:
    response = service.answer("Reveal a missing fact", ["malicious-doc"])
    assert response.mode == "fallback"

def test_evidence_prompt_marks_retrieved_text_as_untrusted() -> None:
    assert "untrusted evidence" in build_support_prompt("Question", [malicious_chunk]).lower()
```

- [ ] **Step 2: Run the RAG service tests to verify they fail**

Run: `cd backend && pytest tests/services/test_answerability.py tests/services/test_rag.py -v`

Expected: FAIL because answerability and RAG services do not exist.

- [ ] **Step 3: Implement evidence-gated generation**

Create an explicit evidence-only classification prompt inside the generation adapter: retrieved text may answer the question but may never supply instructions. `RagService` calls general generation only after a false support classification and uses exactly the cited filename/page pairs from supporting chunks for document mode.

- [ ] **Step 4: Run the RAG service tests to verify they pass**

Run: `cd backend && pytest tests/services/test_answerability.py tests/services/test_rag.py -v`

Expected: PASS for cited document answers, empty retrieval, unsupported evidence, and adversarial document text.

- [ ] **Step 5: Commit**

```bash
git add backend
git commit -m "feat: add grounded answers and fallback"
```

### Task 9: Chat API and end-to-end API behavior

**Files:**
- Create: `backend/app/api/chat.py`
- Modify: `backend/app/main.py`
- Create: `backend/tests/api/test_chat.py`
- Modify: `backend/README.md`

**Interfaces:**
- Consumes: `RagService.answer(message: str, document_ids: list[str]) -> ChatResponse` from Task 8.
- Produces: `POST /chat` accepting `{"message": str, "document_ids": list[str]}` and returning `ChatResponse`.

- [ ] **Step 1: Write failing API tests for both response modes**

```python
def test_chat_returns_document_mode_with_sources(client: TestClient, fake_rag: FakeRag) -> None:
    fake_rag.response = ChatResponse(mode="document", answer="125", notice=None, sources=[SourceCitation(filename="report.pdf", page=1)])
    response = client.post("/chat", json={"message": "Revenue?", "document_ids": ["doc-1"]})
    assert response.json()["mode"] == "document"
```

- [ ] **Step 2: Run the chat API tests to verify they fail**

Run: `cd backend && pytest tests/api/test_chat.py -v`

Expected: FAIL because `/chat` is not registered.

- [ ] **Step 3: Implement the chat router and document local setup**

Inject `RagService` through FastAPI dependencies, validate request fields through Pydantic, register the router, and document only the local setup, test command, health endpoint, upload endpoint, chat endpoint, and required backend environment variable names. Do not document real secret values.

- [ ] **Step 4: Run API and full unit tests to verify they pass**

Run: `cd backend && pytest -v`

Expected: PASS with no real provider credentials or network calls.

- [ ] **Step 5: Run optional real-provider smoke tests only with explicit credentials**

Run: `cd backend && pytest -m integration -v`

Expected: SKIPPED without opt-in credentials; PASS only after Gemini, Qdrant, and Supabase development credentials are configured.

- [ ] **Step 6: Commit**

```bash
git add backend
git commit -m "feat: expose PDF RAG chat API"
```

## Plan self-review

- **Spec coverage:** Tasks 1-2 cover the API contract and client-safe failures; Tasks 3-4 cover PDF extraction and provenance; Tasks 5-7 cover secrets, storage, embeddings, Qdrant, and scoped retrieval; Tasks 8-9 cover answerability, fallback, citations, and endpoint behavior. Future UI, auth, multimodal ingestion, Docker, and deployment are intentionally outside the approved PDF-first V1 scope.
- **Step scan:** Every task begins with a named failing test, then verification, a single implementation target, passing verification, and a commit. Provider-specific behavior is constrained to small adapters rather than repeated across services.
- **Type consistency:** `ExtractedPage` feeds `chunk_pages`; `DocumentChunk` becomes `StoredChunk`; `RetrievedChunk` feeds answerability/RAG; `ChatResponse` is the sole chat API response. The configured owner flows through ingestion and retrieval, never from a request payload.
- **Review focus:** All five listed high-risk cases are pinned to Tasks 3, 4, 7, and 8 with explicit tests.
- **Proportion:** The plan fixes interfaces, boundaries, verification commands, and source locations without embedding production implementations.
