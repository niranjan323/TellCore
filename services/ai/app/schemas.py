"""Response contracts — field names are camelCase to match CoreBackend's
AiPipelineContracts (System.Text.Json web defaults)."""

from pydantic import BaseModel


class Moderation(BaseModel):
    allowed: bool = True
    reason: str | None = None


class EmbeddingChunk(BaseModel):
    index: int
    text: str
    embedding: list[float]


class ProcessStoryResponse(BaseModel):
    language: str | None = None
    title: str | None = None
    transcript: str | None = None
    cleanedText: str
    excerpt: str | None = None
    summary: str | None = None
    translationEn: str | None = None
    tags: list[str] = []
    moderation: Moderation = Moderation()
    wordCount: int = 0
    chunks: list[EmbeddingChunk] = []


class EmbedQueryRequest(BaseModel):
    query: str


class EmbedQueryResponse(BaseModel):
    embedding: list[float]


class TranslateRequest(BaseModel):
    text: str
    title: str | None = None
    targetLanguage: str


class TranslateResponse(BaseModel):
    title: str | None = None
    text: str
