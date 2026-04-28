import json
import re
from app.rag.embedder import embed_query
from app.rag.retriever import retrieve_chunks
from app.schemas.quiz_schema import QuizResponse
from app.llm.groq_api import call_groq

ALLOWED_TOPICS = [
    "variables", "data-types", "functions", "scope", "closures",
    "hoisting", "this", "arrays-objects", "event-loop", "async"
]

def get_fallback(topic: str):
    return QuizResponse(
        question=f"What is {topic} in JavaScript?",
        options=[
            f"A concept related to {topic}",
            f"A function of {topic}",
            "An unrelated concept",
            "A browser feature"
        ],
        correctAnswer=f"A concept related to {topic}",
        explanation=f"This is a placeholder fallback explanation for the topic: {topic}."
    )

def build_quiz_prompt(context_chunks: list, topic: str) -> str:
    context_text = "\n".join([f"{i+1}. {c['text']}" for i, c in enumerate(context_chunks)])

    return f"""Generate EXACTLY 1 JavaScript multiple-choice question based on the CONTEXT.

CONTEXT:
{context_text}

Use ONLY this context. Do not use external knowledge.

TOPIC: {topic}

RULES:
- Must test understanding of {topic}.
- Provide exactly 4 options.
- The correctAnswer MUST exactly match one of the options.
- Explanation MUST be short (2-3 lines) and explain WHY.
- Output ONLY valid JSON. No markdown fences. No extra text.

FORMAT:
{{
  "question": "<question>",
  "options": ["<A>", "<B>", "<C>", "<D>"],
  "correctAnswer": "<exact option text>",
  "explanation": "<short explanation>"
}}
"""

def build_quiz_retry_prompt(bad_output: str) -> str:
    return f"""Extract ONLY the valid JSON object from this text. Fix syntax errors. Return NOTHING ELSE.

{bad_output}
"""

def call_llm(prompt: str) -> str:
    return call_groq(prompt)

def extract_json(raw: str) -> dict:
    cleaned = raw.strip()
    
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    cleaned = re.sub(r",\s*\}", "}", cleaned)
    cleaned = re.sub(r",\s*\]", "]", cleaned)
    cleaned = re.sub(r'([{,]\s*)([a-zA-Z0-9_]+)(\s*:)', r'\1"\2"\3', cleaned)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        extracted = match.group()
        try:
            return json.loads(extracted)
        except json.JSONDecodeError:
            repaired = extracted.replace("'", '"')
            repaired = re.sub(r",\s*\}", "}", repaired)
            repaired = re.sub(r",\s*\]", "]", repaired)
            return json.loads(repaired)

    raise json.JSONDecodeError("No valid JSON object found", cleaned, 0)

def call_llm_with_retry(prompt: str, retry_builder) -> dict:
    raw = call_llm(prompt)
    print("\n[LLM RAW OUTPUT]:\n", raw)
    try:
        return extract_json(raw)
    except (json.JSONDecodeError, ValueError):
        pass  

    retry_prompt = retry_builder(raw)
    raw_retry = call_llm(retry_prompt)
    return extract_json(raw_retry)

def generate_quiz(topic: str) -> QuizResponse:
    if topic not in ALLOWED_TOPICS:
        topic = "variables"

    query_embedding = embed_query(f"Explain {topic} in JavaScript")
    
    # 1. Retrieve chunks (guaranteed to not be empty by the updated retriever)
    chunks = retrieve_chunks(query_embedding, topic=topic, top_k=2)
    print("\n[RETRIEVED CHUNKS]:\n", chunks)

    # 2. Build prompt
    prompt = build_quiz_prompt(chunks, topic)

    # 3. Call LLM with retry
    try:
        data = call_llm_with_retry(prompt, build_quiz_retry_prompt)
    except (json.JSONDecodeError, ValueError, KeyError):
        return get_fallback(topic)

    # 4. Parse and return
    try:
        response = QuizResponse(
            question=data["question"],
            options=data["options"],
            correctAnswer=data["correctAnswer"],
            explanation=data["explanation"].strip(),
        )
        print("\n[Final parsed quiz]:\n", response.model_dump())
        return response
    except (KeyError, TypeError):
        return get_fallback(topic)
