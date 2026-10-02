import json
import uuid
from pathlib import Path
from app.core.config import get_settings
from app.processors.chunker import chunk_pages
from app.processors.pdf_processor import extract_pdf_pages
from app.schemas.documents import UploadResponse
from app.services.embeddings import EmbeddingService, StoredChunk
from app.services.qdrant import VectorStore
from app.services.storage import FileStorage
from app.utils.file_validation import validate_pdf


class DocumentRegistry:
    def __init__(self, registry_file: str = "data/documents_registry.json"):
        self.file_path = Path(registry_file)

    def _load(self) -> dict[str, dict]:
        try:
            if self.file_path.exists():
                content = self.file_path.read_text(encoding="utf-8")
                return json.loads(content)
        except Exception:
            pass
        return {}

    def _save(self, data: dict[str, dict]) -> None:
        try:
            self.file_path.parent.mkdir(parents=True, exist_ok=True)
            self.file_path.write_text(json.dumps(data, indent=2), encoding="utf-8")
        except Exception:
            pass

    def register(self, doc: UploadResponse, user_id: str) -> None:
        data = self._load()
        data[doc.document_id] = {
            "document_id": doc.document_id,
            "filename": doc.filename,
            "chunk_count": doc.chunk_count,
            "status": doc.status,
            "user_id": user_id
        }
        self._save(data)

    def list_all(self, user_id: str) -> list[UploadResponse]:
        data = self._load()
        result = []
        for item in data.values():
            if item.get("user_id") == user_id:
                result.append(UploadResponse(
                    document_id=item["document_id"],
                    filename=item["filename"],
                    chunk_count=item["chunk_count"],
                    status=item.get("status", "ready")
                ))
        return result

    def unregister(self, document_id: str) -> dict | None:
        data = self._load()
        removed = data.pop(document_id, None)
        self._save(data)
        return removed


class DocumentService:
    def __init__(
        self,
        embedding_service: EmbeddingService,
        vector_store: VectorStore,
        file_storage: FileStorage,
        owner_id: str | None = None,
        max_upload_bytes: int | None = None,
        registry: DocumentRegistry | None = None
    ):
        settings = get_settings()
        self.embedding_service = embedding_service
        self.vector_store = vector_store
        self.file_storage = file_storage
        self.owner_id = owner_id or settings.development_owner_id
        self.max_upload_bytes = max_upload_bytes or settings.max_upload_bytes
        self.registry = registry or DocumentRegistry()

    def ingest_pdf(
        self,
        filename: str,
        content_type: str | None,
        content: bytes,
        user_id: str | None = None
    ) -> UploadResponse:
        owner = user_id or self.owner_id
        # 1. Validate file
        validate_pdf(filename, content_type, content, self.max_upload_bytes)

        # 2. Generate document ID
        document_id = str(uuid.uuid4())
        # Note: Raw PDF binary is processed in-memory and embedded to Qdrant without saving physical file to disk

        # 3. Extract text pages

        extracted_pages = extract_pdf_pages(content, filename)

        # 4. Chunk pages
        chunks = chunk_pages(extracted_pages)

        # 5. Convert to StoredChunk objects
        stored_chunks = [
            StoredChunk(
                text=c.text,
                filename=c.filename,
                page=c.page,
                chunk_id=f"{document_id}_{c.chunk_id}",
                file_type=c.file_type,
                user_id=owner,
                document_id=document_id
            )
            for c in chunks
        ]

        # 6. Generate embeddings
        texts = [c.text for c in stored_chunks]
        embeddings = self.embedding_service.embed_documents(texts)

        # 7. Upsert to vector database
        self.vector_store.upsert(stored_chunks, embeddings)

        # 8. Save PDF bytes to file storage for PDF preview/rendering
        self.file_storage.save_pdf(document_id, filename, content)

        response = UploadResponse(
            document_id=document_id,
            filename=filename,
            chunk_count=len(stored_chunks),
            status="ready"
        )

        # 9. Register document metadata
        self.registry.register(response, owner)

        return response

    def list_documents(self, user_id: str | None = None) -> list[UploadResponse]:
        owner = user_id or self.owner_id
        return self.registry.list_all(owner)

    def get_document_file(self, document_id: str) -> tuple[bytes, str] | None:
        # 1. Try direct disk storage lookup first by document_id
        content = self.file_storage.get_pdf(document_id, "")
        if content:
            # Retrieve filename from registry if available, else default
            data = self.registry._load()
            item = data.get(document_id, {})
            filename = item.get("filename", f"{document_id}.pdf")
            return content, filename

        # 2. Check registry list
        docs = self.registry.list_all(self.owner_id)
        doc_meta = next((d for d in docs if d.document_id == document_id), None)
        if doc_meta:
            content = self.file_storage.get_pdf(document_id, doc_meta.filename)
            if content:
                return content, doc_meta.filename

        # 3. Check raw registry dict
        data = self.registry._load()
        item = data.get(document_id)
        if item:
            doc_filename = item.get("filename", "document.pdf")
            content = self.file_storage.get_pdf(document_id, doc_filename)
            if content:
                return content, doc_filename

        return None

    def delete_document(self, document_id: str) -> bool:
        doc_meta = self.registry.unregister(document_id)
        if not doc_meta:
            return False
        
        self.vector_store.delete_document(document_id)
        filename = doc_meta.get("filename", "")
        if filename:
            try:
                self.file_storage.delete_pdf(document_id, filename)
            except Exception:
                pass
        return True

    def clear_all_documents(self) -> int:
        data = self.registry._load()
        count = len(data)
        for doc_id in list(data.keys()):
            self.delete_document(doc_id)
        self.registry._save({})
        return count


