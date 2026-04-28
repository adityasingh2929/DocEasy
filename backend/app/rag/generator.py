import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "phi3"


def call_llm(prompt: str):
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False
        }
    )

    return response.json()["response"]


def build_prompt(context, query, topic, mode):
    context_text = "\n".join([c["text"] for c in context])

    # 🟢 CONCEPT MODE
    if mode == "concept":
        return f"""
You are a JavaScript tutor.

Context:
{context_text}

Explain the concept clearly.

Question:
{query}

Rules:
- Answer only using context
- Keep it simple
- Give example if possible
"""

    # 🔵 QUIZ MODE
    elif mode == "quiz":
        return f"""
You are a JavaScript tutor.

Context:
{context_text}

Generate 1 multiple choice question.

Rules:
- Based ONLY on context
- 4 options
- Only 1 correct answer
- Show correct answer at end

Topic: {topic}
"""

    # 🔴 CHALLENGE MODE
    elif mode == "challenge":
        return f"""
You are a JavaScript tutor.

Context:
{context_text}

Generate a coding challenge.

Rules:
- Give code snippet
- Ask output or behavior
- Keep it beginner friendly

Topic: {topic}
"""

    # fallback
    return f"""
Context:
{context_text}

Question:
{query}
"""


def generate_answer(context_chunks, query, topic, mode):
    prompt = build_prompt(context_chunks, query, topic, mode)
    return call_llm(prompt)