from fastapi import APIRouter, HTTPException
from app.schemas.quiz_schema import QuizRequest, QuizResponse
from app.services.quiz_service import generate_quiz

router = APIRouter()


@router.post("/quiz", response_model=QuizResponse)
def create_quiz(request: QuizRequest) -> QuizResponse:
    try:
        return generate_quiz(request.topic)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quiz generation failed: {str(e)}")
