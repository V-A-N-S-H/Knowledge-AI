from app.core.errors import AppError


def validate_pdf(filename: str, content_type: str | None, content: bytes, max_bytes: int) -> None:
    # 1. Check filename extension
    if not filename.lower().endswith(".pdf"):
        raise AppError(status_code=400, public_message="Only PDF files are supported.")
    
    # 2. Check file size limit
    if len(content) > max_bytes:
        max_mb = max_bytes // (1024 * 1024)
        raise AppError(
            status_code=400,
            public_message=f"Uploaded file size exceeds the {max_mb} MB limit."
        )
    
    # 3. Check PDF magic bytes (%PDF-)
    if not content.startswith(b"%PDF-"):
        raise AppError(status_code=400, public_message="Uploaded file is not a valid PDF document.")
