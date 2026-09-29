import io
import fitz
from fastapi.testclient import TestClient


def create_test_pdf() -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "Test Document Content")
    content = doc.tobytes()
    doc.close()
    return content


def test_upload_document_endpoint_success(client: TestClient) -> None:
    pdf_bytes = create_test_pdf()
    response = client.post(
        "/documents/upload",
        files={"file": ("test.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "test.pdf"
    assert data["status"] == "ready"
    assert data["chunk_count"] > 0
    assert "document_id" in data


def test_upload_document_endpoint_rejects_invalid_file(client: TestClient) -> None:
    response = client.post(
        "/documents/upload",
        files={"file": ("test.txt", io.BytesIO(b"Hello world"), "text/plain")}
    )
    assert response.status_code == 400
    assert "detail" in response.json()
