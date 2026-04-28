import json
import re
from app.rag.embedder import embed_query
from app.rag.retriever import retrieve_chunks
from app.llm.groq_api import call_groq

def extract_json(raw: str) -> str:
    cleaned = raw.strip()
    cleaned = re.sub(r"^```json\s*", "", cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r"^```\s*", "", cleaned, flags=re.MULTILINE)
    
    try:
        parsed = json.loads(cleaned)
        return json.dumps(parsed, indent=2)
    except Exception:
        return cleaned

def build_concept_prompt(context_chunks: list, topic: str) -> str:
    context_text = "\n".join([f"{i+1}. {c['text']}" for i, c in enumerate(context_chunks)])
    
    return f"""CONTEXT:
{context_text}

INSTRUCTION:
You MUST explain using ONLY the provided context.
Do NOT use external knowledge.
If something is missing, say 'not specified in documentation'.

CONTENT RULES:
- beginner-friendly language
- short paragraphs
- no advanced concepts unless present in context
- example MUST match topic

OUTPUT STRUCTURE:
Force this format:
{{
  "title": "{topic}",
  "explanation": "<simple explanation>",
  "keyPoints": [
    "<point 1>",
    "<point 2>"
  ],
  "example": "<simple JS example>",
  "summary": "<short recap>"
}}

JSON ONLY OUTPUT. No markdown, no text outside JSON.
"""

def generate_concept(topic: str) -> str:
    query_embedding = embed_query(topic)
    
    # Limit context to top 2 chunks from retriever
    chunks = retrieve_chunks(query_embedding, topic=topic, top_k=2)
    
    if not chunks:
        return json.dumps({
            "title": topic,
            "explanation": "not specified in documentation.",
            "keyPoints": [],
            "example": "",
            "summary": "not specified in documentation."
        }, indent=2)
        
    prompt = build_concept_prompt(chunks, topic)
    
    try:
        raw_response = call_groq(prompt)
        return extract_json(raw_response)
    except Exception as e:
        print(f"\n[LLM Generation Error]: {e}")
        return json.dumps({
            "title": topic,
            "explanation": "Failed to generate concept.",
            "keyPoints": [],
            "example": "",
            "summary": "API Error"
        }, indent=2)
