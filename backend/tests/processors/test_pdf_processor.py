import fitz
import pytest
from app.core.errors import AppError
from app.processors.pdf_processor import extract_pdf_pages, ExtractedPage


@pytest.fixture
def sample_pdf_bytes() -> bytes:
    doc = fitz.open()
    
    # Page 1
    page1 = doc.new_page()
    page1.insert_text((50, 50), "Revenue: 125 crore")
    
    # Page 2
    page2 = doc.new_page()
    page2.insert_text((50, 50), "Cost: 80 crore")
    
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


@pytest.fixture
def textless_pdf_bytes() -> bytes:
    doc = fitz.open()
    doc.new_page()  # Blank page with no text
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def test_extract_pdf_pages_preserves_text_and_page_number(sample_pdf_bytes: bytes) -> None:
    pages = extract_pdf_pages(sample_pdf_bytes, "annual-report.pdf")
    assert len(pages) == 2
    assert pages[0] == ExtractedPage(text="Revenue: 125 crore", filename="annual-report.pdf", page=1)
    assert pages[1] == ExtractedPage(text="Cost: 80 crore", filename="annual-report.pdf", page=2)


def test_extract_pdf_pages_raises_error_for_textless_pdf(textless_pdf_bytes: bytes) -> None:
    with pytest.raises(AppError) as exc_info:
        extract_pdf_pages(textless_pdf_bytes, "scanned.pdf")
    assert exc_info.value.status_code == 400
    assert "no readable text" in exc_info.value.public_message.lower()


def test_extract_pdf_pages_raises_error_for_corrupt_pdf() -> None:
    corrupt_bytes = b"%PDF-1.4\nCorrupt PDF data..."
    with pytest.raises(AppError) as exc_info:
        extract_pdf_pages(corrupt_bytes, "corrupt.pdf")
    assert exc_info.value.status_code == 400
