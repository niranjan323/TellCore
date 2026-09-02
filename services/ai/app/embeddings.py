"""Local multilingual embeddings via fastembed (ONNX — no PyTorch).

Model: paraphrase-multilingual-MiniLM-L12-v2 → 384 dimensions, matching the
VECTOR(384) column in SQL Server. Loaded once at startup.
"""

from fastembed import TextEmbedding

from .config import get_settings

_model: TextEmbedding | None = None


def load_model() -> TextEmbedding:
    global _model
    if _model is None:
        _model = TextEmbedding(model_name=get_settings().embedding_model)
    return _model


def embed_texts(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    model = load_model()
    return [vector.tolist() for vector in model.embed(texts)]


def chunk_text(text: str, max_chars: int = 800, max_chunks: int = 8) -> list[str]:
    """Merge paragraphs into chunks of at most max_chars, preserving order."""
    paragraphs = [p.strip() for p in text.split("\n") if p.strip()]
    chunks: list[str] = []
    current = ""
    for paragraph in paragraphs:
        candidate = f"{current}\n{paragraph}".strip() if current else paragraph
        if len(candidate) <= max_chars:
            current = candidate
        else:
            if current:
                chunks.append(current)
            # A single oversized paragraph is split hard.
            while len(paragraph) > max_chars:
                chunks.append(paragraph[:max_chars])
                paragraph = paragraph[max_chars:]
            current = paragraph
        if len(chunks) >= max_chunks:
            return chunks[:max_chunks]
    if current and len(chunks) < max_chunks:
        chunks.append(current)
    return chunks[:max_chunks]
