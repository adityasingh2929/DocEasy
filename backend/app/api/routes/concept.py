from fastapi import APIRouter
from app.schemas.concept_schema import ConceptRequest, ConceptResponse
from app.services.concept_service import generate_concept

router = APIRouter()

@router.post("/concept", response_model=ConceptResponse)
def get_concept(request: ConceptRequest) -> ConceptResponse:
    explanation = generate_concept(request.topic)
    return ConceptResponse(explanation=explanation)
