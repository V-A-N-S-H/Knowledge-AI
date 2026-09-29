from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from app.core.dependencies import get_document_service
from app.schemas.documents import UploadResponse
from app.services.documents import DocumentService

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    doc_service: DocumentService = Depends(get_document_service)
) -> UploadResponse:
    content = await file.read()
    return doc_service.ingest_pdf(
        filename=file.filename or "uploaded.pdf",
        content_type=file.content_type,
        content=content
    )


@router.get("", response_model=list[UploadResponse])
async def list_documents(
    doc_service: DocumentService = Depends(get_document_service)
) -> list[UploadResponse]:
    return doc_service.list_documents()


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    doc_service: DocumentService = Depends(get_document_service)
) -> dict:
    success = doc_service.delete_document(document_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"status": "deleted", "document_id": document_id}
