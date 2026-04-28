from app.schemas.doubt_schema import DoubtRequest
from app.rag.embedder import embed_query
from app.rag.retriever import retrieve_chunks
from app.llm.groq_api import call_groq

def build_chat_prompt(request: DoubtRequest, context_chunks: list) -> str:
    context_text = "\n".join([f"{i+1}. {c['text']}" for i, c in enumerate(context_chunks)])
    
    prompt = f"TOPIC: {request.topic}\n\n"
    
    if request.mode == "quiz":
        if request.currentQuestion:
            prompt += f"QUIZ QUESTION:\n{request.currentQuestion}\n\n"
        if request.options:
            prompt += "OPTIONS:\n" + "\n".join([f"- {opt}" for opt in request.options]) + "\n\n"
        if request.correctAnswer:
            prompt += f"CORRECT ANSWER:\n{request.correctAnswer}\n\n"
        if request.explanation:
            prompt += f"EXPLANATION:\n{request.explanation}\n\n"
        
        prompt += """INSTRUCTION:
You are a JavaScript tutor.
Explain the answer clearly.

- Explain why the correct option is correct
- Explain why the other options are wrong
- Use simple beginner-friendly language
- Use the provided explanation and context
- Do NOT introduce new unrelated concepts
"""

    elif request.mode == "challenge":
        if request.currentQuestion:
            prompt += f"CODING PROBLEM:\n{request.currentQuestion}\n\n"
        if request.code:
            prompt += f"CODE SNIPPET:\n{request.code}\n\n"
        if request.correctAnswer:
            prompt += f"CORRECT OUTPUT:\n{request.correctAnswer}\n\n"
        if request.explanation:
            prompt += f"EXPLANATION:\n{request.explanation}\n\n"
        
        prompt += """INSTRUCTION:
You are a JavaScript tutor.

- Walk through the code step-by-step
- Explain how the output is produced
- Explain common mistakes
- Keep it beginner-friendly
- Do NOT skip steps
"""

    else:
        prompt += """INSTRUCTION:
You are a JavaScript tutor.
- Use retrieved chunks
- Explain concept using documentation only
- Keep it beginner-friendly
"""

    prompt += f"\nCONTEXT:\n{context_text}\n"
    prompt += "\nSTRICT RULE:\nUse ONLY the provided context. Do not hallucinate.\n"
    
    prompt += f"\nUSER QUESTION:\n{request.question}\n"
    
    return prompt

def handle_doubt(request: DoubtRequest) -> str:
    if request.contextChunks and len(request.contextChunks) > 0:
        chunks = request.contextChunks
    else:
        query_embedding = embed_query(request.topic)
        chunks = retrieve_chunks(query_embedding, topic=request.topic, top_k=3)
        
    if not chunks:
        return "I'm sorry, I don't have enough context in my documentation to answer that."
        
    prompt = build_chat_prompt(request, chunks)
    
    try:
        answer = call_groq(prompt)
        return answer
    except Exception as e:
        print(f"\n[LLM Chat Error]: {e}")
        return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later."