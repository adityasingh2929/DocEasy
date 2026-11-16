from fastapi import APIRouter
from app.schemas.doubt_schema import DoubtRequest, DoubtResponse
from app.services.doubt_service import handle_doubt
from app.rag.retriever import retrieve_chunks, sources_for_chunks
from app.services.practice_service import topic_bank

router = APIRouter()

@router.post('/doubt', response_model=DoubtResponse)
def ask_doubt(request: DoubtRequest):
    topic_bank(request.topic)
    chunks = retrieve_chunks(request.question, topic=request.topic, top_k=3)
    # Sources describe the server-selected documentation, never arbitrary client text.
    trusted = request.model_copy(update={'contextChunks': chunks})
    return DoubtResponse(answer=handle_doubt(trusted), sources=sources_for_chunks(chunks, request.topic), helpLevel=request.helpLevel)
