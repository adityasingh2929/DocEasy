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
    return [{"text": item["text"], "topic": item["topic"], "score": 1.0, "chunkId": item.get("chunk_id")}
            for item in ranked[:max(0, top_k)]]


def sources_for_chunks(chunks, topic):
    from app.services.practice_service import references
    sources = references(topic)
    # Existing corpus preserves topic/chunk IDs, not original source URLs.
    # Label mapped documentation links honestly, rather than claiming passage citations.
    return [{**source, 'kind': 'mapped topic reference', 'chunkId': chunks[0].get('chunkId') if chunks else None}
            for source in sources]
