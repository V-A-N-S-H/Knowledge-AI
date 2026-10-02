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


def _create_fallback_pdf(title: str) -> bytes:
    clean_title = title.replace("(", "").replace(")", "").encode("latin1", "ignore").decode("latin1")
    stream_content = f"BT /F1 20 Tf 50 720 Td ({clean_title}) Tj 0 -30 Td /F1 12 Tf (StudyMateAI Indexed Document) Tj ET".encode("latin1")
    stream_len = len(stream_content)
    pdf = (
        b"%PDF-1.4\n"
        b"1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n"
        b"2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n"
        b"3 0 obj <</Type /Page /Parent 2 0 R /Resources <</Font <</F1 4 0 R>>>> /MediaBox [0 0 612 792] /Contents 5 0 R>> endobj\n"
        b"4 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj\n"
        b"5 0 obj <</Length " + str(stream_len).encode() + b">> stream\n"
        + stream_content + b"\nendstream\nendobj\n"
        b"xref\n0 6\n0000000000 65535 f \n"
        b"trailer <</Size 6 /Root 1 0 R>>\n"
        b"startxref\n180\n%%EOF\n"
    )
    return pdf


@router.get("/{document_id}/file")
async def get_document_file(
    document_id: str,
    doc_service: DocumentService = Depends(get_document_service)
):
    result = doc_service.get_document_file(document_id)
    if result:
        content, filename = result
    else:
        # Fallback to dynamic valid PDF for sample/demo files
        content = _create_fallback_pdf(f"Document_{document_id[:8]}.pdf")
        filename = f"{document_id}.pdf"

    from fastapi import Response
    return Response(
        content=content,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{filename}"',
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Cache-Control": "no-cache"
        }
    )



from app.services.chat_sessions import ChatSessionRegistry

session_registry = ChatSessionRegistry()

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    doc_service: DocumentService = Depends(get_document_service)
) -> dict:
    success = doc_service.delete_document(document_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    session_registry.delete_session(document_id)
    return {"status": "deleted", "document_id": document_id}


@router.delete("", response_model=dict)
async def delete_all_documents(
    doc_service: DocumentService = Depends(get_document_service)
) -> dict:
    count = doc_service.clear_all_documents()
    session_registry.clear_all()
    return {"status": "cleared", "deleted_count": count}

