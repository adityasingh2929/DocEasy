from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from pydantic import Field
from typing import Literal
from app.schemas.source_schema import DocumentationSource

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
    helpLevel: Literal['hint1', 'hint2', 'explanation'] = 'hint1'

class DoubtResponse(BaseModel):
    answer: str
    sources: List[DocumentationSource] = Field(default_factory=list)
    helpLevel: str = 'hint1'
