from fastapi import APIRouter, Request, HTTPException
from starlette.concurrency import run_in_threadpool
from app.services import document_service as service

router = APIRouter(prefix='/documents')


@router.post('/upload')
async def upload(request: Request):
    # Bound the complete body before multipart parsing, including chunked requests.
    body = bytearray()
    async for part in request.stream():
        body.extend(part)
        if len(body) > service.MAX_FILE + 64 * 1024:
            raise HTTPException(413, 'The upload limit is 5 MB.')
    async def receive():
        return {'type': 'http.request', 'body': bytes(body), 'more_body': False}
    bounded = Request(request.scope, receive)
    async with bounded.form(max_files=1, max_fields=0) as form:
        file = form.get('file')
        if file is None or not hasattr(file, 'read'):
            raise HTTPException(422, 'Choose a file to upload.')
        data = await file.read(service.MAX_FILE + 1)
        return await run_in_threadpool(service.upload_document, file.filename, file.content_type, data)


@router.get('/{document_id}')
def status(document_id: str):
    return service.get_document(document_id)


@router.post('/{document_id}/quiz')
def quiz(document_id: str, request: service.GenerationRequest):
    return service.generate(document_id, request, 'quiz')


@router.post('/{document_id}/challenge')
def challenge(document_id: str, request: service.GenerationRequest):
    return service.generate(document_id, request, 'challenge')


@router.delete('/{document_id}', status_code=204)
def delete(document_id: str):
    service.delete_document(document_id)
