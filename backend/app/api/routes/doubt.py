from fastapi import APIRouter
from app.schemas.doubt_schema import DoubtRequest, DoubtResponse
from app.services.doubt_service import handle_doubt

router = APIRouter()


@router.post("/doubt", response_model=DoubtResponse)
def ask_doubt(request: DoubtRequest) -> DoubtResponse:
    answer = handle_doubt(request)
    return DoubtResponse(answer=answer)
