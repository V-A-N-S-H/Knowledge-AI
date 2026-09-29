import pytest
from app.core.errors import AppError
from app.processors.pdf_processor import ExtractedPage
from app.processors.chunker import chunk_pages, DocumentChunk


def test_chunk_pages_preserves_page_and_overlap() -> None:
    page = ExtractedPage(text="one two three four five", filename="r.pdf", page=2)
    chunks = chunk_pages([page], chunk_size=3, overlap=1)
    
    assert len(chunks) == 2
    assert chunks[0] == DocumentChunk(
        text="one two three",
        filename="r.pdf",
        page=2,
        chunk_id="r.pdf_p2_c0",
        file_type="pdf"
    )
    assert chunks[1] == DocumentChunk(
        text="three four five",
        filename="r.pdf",
        page=2,
        chunk_id="r.pdf_p2_c1",
        file_type="pdf"
    )


def test_chunk_pages_does_not_cross_page_boundaries() -> None:
    page1 = ExtractedPage(text="page one text", filename="doc.pdf", page=1)
    page2 = ExtractedPage(text="page two text", filename="doc.pdf", page=2)
    
    chunks = chunk_pages([page1, page2], chunk_size=10, overlap=2)
    
    # Even though chunk_size=10 is larger than words in page 1, it should not combine page 1 and page 2
    assert len(chunks) == 2
    assert chunks[0].page == 1
    assert chunks[0].text == "page one text"
    assert chunks[1].page == 2
    assert chunks[1].text == "page two text"


def test_chunk_pages_validates_invalid_settings() -> None:
    page = ExtractedPage(text="hello world", filename="doc.pdf", page=1)
    
    with pytest.raises(AppError):
        chunk_pages([page], chunk_size=0, overlap=0)
        
    with pytest.raises(AppError):
        chunk_pages([page], chunk_size=5, overlap=5)
