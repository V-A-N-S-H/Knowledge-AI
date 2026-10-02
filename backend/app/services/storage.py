from pathlib import Path
from typing import Protocol
from app.core.errors import AppError


class FileStorage(Protocol):
    def save_pdf(self, document_id: str, filename: str, content: bytes) -> str:
        ...

    def get_pdf(self, document_id: str, filename: str) -> bytes | None:
        ...

    def delete_pdf(self, document_id: str, filename: str) -> None:
        ...


class FakeFileStorage:
    def __init__(self):
        self.files: dict[str, bytes] = {}

    def save_pdf(self, document_id: str, filename: str, content: bytes) -> str:
        storage_path = f"uploads/{document_id}/{filename}"
        self.files[storage_path] = content
        return storage_path

    def get_pdf(self, document_id: str, filename: str) -> bytes | None:
        storage_path = f"uploads/{document_id}/{filename}"
        return self.files.get(storage_path)

    def delete_pdf(self, document_id: str, filename: str) -> None:
        storage_path = f"uploads/{document_id}/{filename}"
        self.files.pop(storage_path, None)


class LocalFileStorage:
    def __init__(self, upload_dir: str = "data/uploads"):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def save_pdf(self, document_id: str, filename: str, content: bytes) -> str:
        try:
            doc_dir = self.upload_dir / document_id
            doc_dir.mkdir(parents=True, exist_ok=True)
            file_path = doc_dir / filename
            file_path.write_bytes(content)
            return str(file_path)
        except Exception as e:
            raise AppError(status_code=500, public_message=f"Failed to save uploaded PDF file locally: {str(e)}")

    def get_pdf(self, document_id: str, filename: str) -> bytes | None:
        doc_dir = self.upload_dir / document_id
        if doc_dir.exists():
            if filename:
                exact_path = doc_dir / filename
                if exact_path.exists():
                    return exact_path.read_bytes()
            for f in doc_dir.iterdir():
                if f.is_file() and (f.suffix.lower() in [".pdf", ".doc", ".docx"] or f.name == filename):
                    return f.read_bytes()

        if self.upload_dir.exists():
            for f in self.upload_dir.rglob("*.pdf"):
                if f.name == filename or document_id in f.name or document_id in str(f):
                    return f.read_bytes()
        return None

    def delete_pdf(self, document_id: str, filename: str) -> None:
        doc_dir = self.upload_dir / document_id
        file_path = doc_dir / filename
        if file_path.exists():
            file_path.unlink()
        if doc_dir.exists() and not any(doc_dir.iterdir()):
            try:
                doc_dir.rmdir()
            except Exception:
                pass


class SupabaseFileStorage:
    def __init__(self, url: str, key: str, bucket: str = "documents", fallback_storage: FileStorage | None = None):
        self.url = url
        self.key = key
        self.bucket = bucket
        self.fallback_storage = fallback_storage or LocalFileStorage()
        self._client = None

    def _get_client(self):
        if not self.url or not self.key:
            return None
        if self._client is None:
            from supabase import create_client
            self._client = create_client(self.url, self.key)
        return self._client

    def save_pdf(self, document_id: str, filename: str, content: bytes) -> str:
        client = self._get_client()
        if client is None:
            return self.fallback_storage.save_pdf(document_id, filename, content)

        storage_path = f"uploads/{document_id}/{filename}"
        try:
            client.storage.from_(self.bucket).upload(
                path=storage_path,
                file=content,
                file_options={"content-type": "application/pdf"}
            )
            self.fallback_storage.save_pdf(document_id, filename, content)
            return storage_path
        except Exception:
            return self.fallback_storage.save_pdf(document_id, filename, content)

    def get_pdf(self, document_id: str, filename: str) -> bytes | None:
        return self.fallback_storage.get_pdf(document_id, filename)

    def delete_pdf(self, document_id: str, filename: str) -> None:
        self.fallback_storage.delete_pdf(document_id, filename)
        client = self._get_client()
        if client is not None:
            try:
                storage_path = f"uploads/{document_id}/{filename}"
                client.storage.from_(self.bucket).remove([storage_path])
            except Exception:
                pass
