import fitz
from pydantic import BaseModel
from app.core.errors import AppError


class ExtractedPage(BaseModel):
    text: str
    filename: str
    page: int  # 1-based page index


def extract_pdf_pages(content: bytes, filename: str) -> list[ExtractedPage]:
    try:
        doc = fitz.open(stream=content, filetype="pdf")
    except Exception as e:
        raise AppError(status_code=400, public_message="Failed to parse PDF content. File may be corrupted.")

    pages: list[ExtractedPage] = []
    total_text_length = 0

    for i, page in enumerate(doc, start=1):
        text = page.get_text().strip()
        total_text_length += len(text)
        if text:
            pages.append(ExtractedPage(text=text, filename=filename, page=i))
            
    doc.close()

    if total_text_length == 0:
        raise AppError(status_code=400, public_message="PDF contains no readable text.")

    return pages
