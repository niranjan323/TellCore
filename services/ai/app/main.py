"""Internal AI pipeline service. Called ONLY by CoreBackend (shared-secret
header) — never exposed to frontends."""

import logging
import secrets
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile

from .config import get_settings
from .embeddings import embed_texts, load_model
from .pipeline import story_pipeline
from .schemas import (
    EmbeddingChunk,
    EmbedQueryRequest,
    EmbedQueryResponse,
    Moderation,
    ProcessStoryResponse,
    TranslateRequest,
    TranslateResponse,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
logger = logging.getLogger("main")


@asynccontextmanager
async def lifespan(_: FastAPI):
    load_model()  # pay the embedding-model load cost once, at startup
    logger.info("embedding model loaded")
    yield


app = FastAPI(title="TheUntold AI Pipeline", lifespan=lifespan)


def require_internal_secret(x_internal_secret: str = Header(default="")) -> None:
    expected = get_settings().internal_shared_secret
    if not secrets.compare_digest(x_internal_secret, expected):
        raise HTTPException(status_code=401, detail="invalid internal secret")


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/v1/process-story", response_model=ProcessStoryResponse,
          dependencies=[Depends(require_internal_secret)])
async def process_story(
    kind: str = Form("text"),
    text: str | None = Form(None),
    title_hint: str | None = Form(None),
    audio: UploadFile | None = File(None),
) -> ProcessStoryResponse:
    audio_bytes = await audio.read() if audio is not None else None
    if not (text and text.strip()) and not audio_bytes:
        raise HTTPException(status_code=400, detail="text or audio is required")

    state = story_pipeline.invoke({
        "kind": kind,
        "text": text,
        "title_hint": title_hint,
        "audio_bytes": audio_bytes,
        "audio_filename": audio.filename if audio is not None else None,
    })

    cleaned = state.get("cleaned_text") or (text or "").strip()
    return ProcessStoryResponse(
        language=state.get("language"),
        title=state.get("title"),
        transcript=state.get("transcript"),
        cleanedText=cleaned,
        excerpt=state.get("excerpt"),
        summary=state.get("summary"),
        translationEn=state.get("translation_en"),
        tags=state.get("tags") or [],
        moderation=Moderation(
            allowed=state.get("allowed", True),
            reason=state.get("reason"),
        ),
        wordCount=len(cleaned.split()),
        chunks=[EmbeddingChunk(**c) for c in state.get("chunks") or []],
    )


@app.post("/v1/embed-query", response_model=EmbedQueryResponse,
          dependencies=[Depends(require_internal_secret)])
def embed_query(request: EmbedQueryRequest) -> EmbedQueryResponse:
    query = request.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="query is required")
    return EmbedQueryResponse(embedding=embed_texts([query])[0])


@app.post("/v1/translate", response_model=TranslateResponse,
          dependencies=[Depends(require_internal_secret)])
def translate(request: TranslateRequest) -> TranslateResponse:
    from .pipeline import translate_story

    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="text is required")
    result = translate_story(text, request.title, request.targetLanguage)
    return TranslateResponse(title=result.get("title"), text=result["text"])
