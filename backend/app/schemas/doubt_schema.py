from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class DoubtRequest(BaseModel):
    topic: str
    question: str
    mode: str
    contextChunks: Optional[List[Dict[str, Any]]] = None
    currentQuestion: Optional[str] = None
    options: Optional[List[str]] = None
    correctAnswer: Optional[str] = None
    explanation: Optional[str] = None
    code: Optional[str] = None

class DoubtResponse(BaseModel):
    answer: str
