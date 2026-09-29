from app.services.storage import FakeFileStorage


def test_fake_file_storage_saves_and_retrieves_files() -> None:
    storage = FakeFileStorage()
    path = storage.save_pdf("doc-123", "report.pdf", b"%PDF-1.4 sample content")
    
    assert "doc-123" in path
    assert "report.pdf" in path
    assert storage.files[path] == b"%PDF-1.4 sample content"
