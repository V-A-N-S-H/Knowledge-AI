import pytest
from app.core.errors import AppError
from app.utils.file_validation import validate_pdf


def test_validate_pdf_accepts_valid_pdf_signature() -> None:
    # PDF magic bytes %PDF-
    content = b"%PDF-1.4\n%...\n%%EOF"
    validate_pdf("report.pdf", "application/pdf", content, max_bytes=1000)


def test_validate_pdf_rejects_non_pdf_extension() -> None:
    content = b"%PDF-1.4\n%...\n%%EOF"
    with pytest.raises(AppError) as exc_info:
        validate_pdf("report.txt", "application/pdf", content, max_bytes=1000)
    assert exc_info.value.status_code == 400
    assert "pdf" in exc_info.value.public_message.lower()


def test_validate_pdf_rejects_non_pdf_content_named_pdf() -> None:
    content = b"Not a real PDF file header"
    with pytest.raises(AppError) as exc_info:
        validate_pdf("report.pdf", "application/pdf", content, max_bytes=1000)
    assert exc_info.value.status_code == 400
    assert "valid pdf" in exc_info.value.public_message.lower()


def test_validate_pdf_rejects_oversized_file() -> None:
    content = b"%PDF-1.4\n" + b"A" * 2000
    with pytest.raises(AppError) as exc_info:
        validate_pdf("report.pdf", "application/pdf", content, max_bytes=1000)
    assert exc_info.value.status_code == 400
    assert "exceeds" in exc_info.value.public_message.lower()
