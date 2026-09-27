# KnowledgeAI: PDF-first RAG platform design

## 1. Purpose

KnowledgeAI is a full-stack knowledge assistant for user-owned files. It must
search uploaded material before answering and make the answer source explicit:

- **Document mode:** the uploaded material contains sufficient evidence. Return
  a source-grounded answer with citations.
- **Fallback mode:** the uploaded material does not contain sufficient
  evidence. Say so clearly, then provide a separately labelled answer based on
  Gemini's general knowledge.

The portfolio project will grow into multimodal ingestion, but the first
working milestone deliberately supports PDFs only.

## 2. Technology choices

| Area | Choice |
| --- | --- |
| Frontend | Next.js, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Python and FastAPI |
| LLM and embeddings | Gemini API |
| Vector search | Qdrant Cloud |
| Authentication and file storage | Supabase Auth and Supabase Storage |
| PDF extraction | PyMuPDF |
| Deployment, later | Vercel, a cloud FastAPI host, Docker, GitHub CI |

Secrets for Gemini, Qdrant, and server-side Supabase access remain in backend
environment variables. They are never supplied to the browser.

## 3. Scope and milestones

### V1: working RAG API

1. FastAPI application, configuration, health endpoint, and automated tests.
2. PDF validation, persistence, extraction, chunking, and page-level metadata.
3. Gemini embeddings and Qdrant collection operations.
4. User/document-scoped semantic retrieval.
5. Answerability decision, grounded generation, and clearly labelled fallback.
6. Upload and chat API endpoints returning source citations.

### Later phases

- Next.js interface, Supabase login, document management, and chat UX.
- Image, audio, and video extraction with source locations or timestamps.
- Conversation memory, question rewriting, evaluation, rate limits, Docker,
  deployment, and observability.

V1 does not promise support for arbitrary files, web search, reranking, or
multi-turn conversation memory.

## 4. Backend boundaries

```text
api/
  health.py       HTTP health check
  documents.py    upload and document lifecycle endpoints
  chat.py         answer endpoint

processors/
  pdf_processor.py  extract text by page
  chunker.py        produce overlapping, traceable chunks

services/
  embedding_service.py      Gemini embedding client
  qdrant_service.py         collection, upsert, and filtered search
  document_service.py       ingestion orchestration
  retrieval_service.py      choose relevant evidence
  answerability_service.py  determine whether evidence suffices
  rag_service.py            create the final response
```

API modules validate requests and delegate to services. Processors transform
files into text and metadata but do not call external services. Service modules
own one external integration or orchestration concern and remain independently
testable.

## 5. Data flow

### Ingestion

```text
PDF upload
  -> validate extension, MIME type, and size
  -> store original file
  -> extract one text record per page
  -> clean minimally and split into overlapping chunks
  -> create Gemini embeddings
  -> upsert vectors and payloads into Qdrant
```

Each stored chunk includes at least `user_id`, `document_id`, `filename`,
`file_type`, `page`, `chunk_id`, and `text`. The backend uses one fixed local
development owner while authentication is out of scope; it never accepts an
owner ID from the browser. Supabase authentication replaces that development
owner with the verified JWT subject before a public deployment. Later media
types add source locations such as timestamps.

### Question answering

```text
Question
  -> create query embedding
  -> Qdrant similarity search filtered to the authenticated user and selected documents
  -> answerability check against retrieved evidence
  -> document-grounded answer with citations OR labelled Gemini fallback
```

Retrieved documents are untrusted content. Prompts must state that retrieved
text is evidence, never instructions that can override application behavior.

## 6. API contract

The initial chat request accepts a `message` and selected `document_ids`. It
uses the fixed local development owner until authentication is added. Supabase
authentication then derives the user identity from a verified JWT, not from a
client-provided ID.

Document answer:

```json
{
  "mode": "document",
  "answer": "The revenue was 125 crore.",
  "notice": null,
  "sources": [{"filename": "annual-report.pdf", "page": 32}]
}
```

Fallback answer:

```json
{
  "mode": "fallback",
  "answer": "...",
  "notice": "This information was not found in your uploaded data.",
  "sources": []
}
```

The answerability classifier must not return a document-mode answer unless the
retrieved context actually supports it. A high similarity score alone is not
sufficient.

## 7. Error handling and security

- Reject unsupported, oversized, corrupt, and unreadable files with helpful
  client-safe messages.
- Never expose provider keys, stack traces, raw prompts, or upstream service
  details in public responses.
- Translate Gemini rate limits, timeouts, and Qdrant unavailability into
  retryable, user-friendly failures.
- Scope every future Qdrant search, document operation, and storage path to the
  authenticated user.
- Validate content type in addition to filename extension and limit uploaded
  file size before processing.

## 8. Verification strategy

Tests will begin before implementation and cover:

1. PDF extraction preserves text and page metadata.
2. Chunking preserves provenance and expected overlap.
3. Retrieval filters by user and document.
4. Supported evidence produces `mode: document` with citations.
5. Missing evidence produces `mode: fallback` with no citations.
6. A document containing adversarial instructions cannot change the RAG
   policy.

External Gemini, Qdrant, and Supabase calls will be isolated behind services,
so unit tests can use fakes. A separate integration suite will exercise the
real services only when valid development credentials are supplied.

## 9. Completion criteria for V1

V1 is complete when a user can upload a valid PDF, the application indexes its
page-level chunks, and the chat endpoint reliably returns either a cited
document answer or a clearly labelled fallback. The response must satisfy the
schema above, unsafe or invalid uploads must fail safely, and the automated
tests must pass.
