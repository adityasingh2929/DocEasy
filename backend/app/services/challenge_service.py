import json
import re
from app.rag.embedder import embed_query
from app.rag.retriever import retrieve_chunks
from app.schemas.challenge_schema import ChallengeResponse
from app.llm.groq_api import call_groq
from fastapi import HTTPException

ALLOWED_TOPICS = [
    "variables", "data-types", "functions", "scope", "closures",
    "hoisting", "this", "arrays-objects", "event-loop", "async"
]


def build_challenge_prompt(context_chunks: list, topic: str) -> str:
    context_text = "\n".join([f"{i+1}. {c['text']}" for i, c in enumerate(context_chunks)])

    return f"""You are a JavaScript coding-challenge generator.

CONTEXT:
{context_text}

Use ONLY this context. Do not use external knowledge.

TOPIC: {topic}

TASK:
Generate EXACTLY one output-prediction challenge.

STRICT RULES:

1. QUESTION FORMAT
- MUST be exactly: "What will be logged to the console?"
- NO variations

2. TOPIC DEPTH & REASONING
- MUST deeply test the user's conceptual understanding of the topic.
- MUST NOT test simple syntax.
- MUST require reasoning to predict the output.
- NEVER use trivial examples (e.g. DO NOT use `let a = "hello"; console.log(a);`).
- The code MUST feature the topic conceptually (e.g. if topic is 'functions', test function scope or call behavior).

3. CODE RULES
- MUST include console.log(...)
- MUST be 2–4 lines.
- MUST be valid JavaScript.
- Avoid output that varies by browser, Node.js, module mode or strict mode.
- Use a complete function wrapper if behavior depends on local function scope.
- For multiple console.log calls, put each output on a separate line in correctAnswer.
- Do not put surrounding display quotes around a logged string unless the string actually contains those quotes.

4. TOPIC ISOLATION
- ONLY use {topic}
- DO NOT introduce unrelated advanced concepts.

5. ANSWER RULES
- Must be exact output only.
- No explanation inside the answer field.

6. EXPLANATION
- 2–3 lines.
- Explain WHY the output occurs based on the topic.

OUTPUT FORMAT:
{{
  "question": "What will be logged to the console?",
  "code": "<code>",
  "correctAnswer": "<output>",
  "explanation": "<short explanation>"
}}

RETURN ONLY JSON.
"""

def build_challenge_retry_prompt(bad_output: str) -> str:
    return f"""Extract ONLY the JSON object from this text.

{bad_output}
"""

def call_llm(prompt: str) -> str:
    return call_groq(prompt)

def extract_json(raw: str) -> dict:
    cleaned = raw.strip()

    if cleaned.startswith("```"):
        cleaned = "\n".join(
            line for line in cleaned.splitlines()
            if not line.strip().startswith("```")
        ).strip()

    try:
        return json.loads(cleaned)
    except:
        pass

    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        return json.loads(match.group())

    raise ValueError("Invalid JSON")

def call_llm_with_retry(prompt: str, retry_builder) -> dict:
    raw = call_llm(prompt)

    try:
        return extract_json(raw)
    except:
        retry_prompt = retry_builder(raw)
        raw_retry = call_llm(retry_prompt)
        return extract_json(raw_retry)

def generate_challenge(topic: str) -> ChallengeResponse:
    if topic not in ALLOWED_TOPICS:
        topic = "variables"

    query_embedding = embed_query(f"Explain {topic} in JavaScript")
    chunks = retrieve_chunks(query_embedding, topic=topic)

    if not chunks:
        raise HTTPException(status_code=503, detail="No documentation found for this topic.")

    prompt = build_challenge_prompt(chunks, topic)

    try:
        data = call_llm_with_retry(prompt, build_challenge_retry_prompt)
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Challenge generation is temporarily unavailable. Please try again.") from exc

    try:
        return ChallengeResponse(
            question=data["question"],
            code=data["code"],
            correctAnswer=str(data["correctAnswer"]).strip(),
            explanation=data["explanation"].strip(),
        )
    except Exception as exc:
        raise HTTPException(status_code=503, detail="The generated challenge was invalid. Please try again.") from exc
