"""Lightweight topic and keyword retrieval without an embedding model."""
import json
import re
from pathlib import Path

with (Path(__file__).resolve().parents[2] / "data" / "chunks.json").open(encoding="utf-8") as source:
    data = json.load(source)

TOPIC_SOURCES = {
    "variables": ("var", "let", "const"),
    "data-types": ("data-types",),
    "functions": ("functions",),
    "scope": ("closures", "let", "var", "const"),
    "closures": ("closures",),
    "hoisting": ("var", "let", "const", "functions"),
    "this": ("this",),
    "arrays-objects": ("array", "object", "working-with-objects"),
    "event-loop": ("execution-model",),
    "async": ("using-promises", "promise", "async-function", "await"),
}

def retrieve_chunks(query_embedding, topic=None, top_k=2):
    sources = TOPIC_SOURCES.get(topic, (topic,)) if topic else None
    candidates = [item for item in data if sources is None or item["topic"] in sources]
    query = query_embedding if isinstance(query_embedding, str) else ""
    terms = set(re.findall(r"[a-z]{3,}", f"{topic or ''} {query}".lower()))
    ranked = sorted(candidates, key=lambda item: sum(
        len(re.findall(r"\b" + re.escape(term) + r"\b", item["text"].lower()))
        for term in terms
    ), reverse=True)
    return [{"text": item["text"], "topic": item["topic"], "score": 1.0}
            for item in ranked[:max(0, top_k)]]
