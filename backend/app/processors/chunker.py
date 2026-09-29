from pydantic import BaseModel
from app.core.errors import AppError
from app.processors.pdf_processor import ExtractedPage


class DocumentChunk(BaseModel):
    text: str
    filename: str
    page: int
    chunk_id: str
    file_type: str = "pdf"


def chunk_pages(
    pages: list[ExtractedPage],
    chunk_size: int = 200,
    overlap: int = 50
) -> list[DocumentChunk]:
    if chunk_size <= 0:
        raise AppError(status_code=400, public_message="Chunk size must be greater than zero.")
    if overlap < 0 or overlap >= chunk_size:
        raise AppError(status_code=400, public_message="Overlap must be non-negative and strictly less than chunk size.")

    chunks: list[DocumentChunk] = []

    for page_obj in pages:
        words = page_obj.text.split()
        if not words:
            continue

        step = chunk_size - overlap
        word_index = 0
        chunk_idx = 0

        while word_index < len(words):
            chunk_words = words[word_index : word_index + chunk_size]
            chunk_text = " ".join(chunk_words)
            chunk_id = f"{page_obj.filename}_p{page_obj.page}_c{chunk_idx}"

            chunks.append(
                DocumentChunk(
                    text=chunk_text,
                    filename=page_obj.filename,
                    page=page_obj.page,
                    chunk_id=chunk_id,
                    file_type="pdf"
                )
            )

            if word_index + chunk_size >= len(words):
                break

            word_index += step
            chunk_idx += 1

    return chunks
