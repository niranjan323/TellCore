"""LangGraph story pipeline: transcribe → analyze → moderate → embed.

- transcribe: Groq Whisper (voice stories only; auto language detection)
- analyze:   one structured Groq LLM call — language, title, light cleanup
             (preserving the writer's voice), excerpt, English translation,
             tags, contact-info detection
- moderate:  Llama Guard safety check + contact-info gate
- embed:     local multilingual embeddings (fastembed, 384-dim)
"""

import io
import json
import logging
from typing import Any, TypedDict

from groq import Groq
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from langgraph.graph import END, START, StateGraph

from .config import get_settings
from .embeddings import chunk_text, embed_texts

logger = logging.getLogger("pipeline")

ALLOWED_TAGS = {
    "childhood", "family", "love", "lesson", "regret",
    "joy", "memory", "loss", "courage", "home",
}

ANALYZE_SYSTEM_PROMPT = """You process personal life stories for a story-keeping app.
The story may be written in ANY language, or transcribed from voice (so it may contain
filler words and transcription artifacts).

Return STRICT JSON — no markdown, no commentary — with exactly these keys:
- "language": ISO 639-1 code of the story's language (e.g. "en", "te", "hi", "es")
- "title": a short, evocative title in the story's own language, max 60 characters.
  If a decent title hint is provided, keep it as-is.
- "cleanedText": the story lightly cleaned. Fix punctuation, remove filler words and
  transcription artifacts, add paragraph breaks. PRESERVE the writer's own voice and
  words — do not rewrite, embellish, shorten, or add anything.
- "excerpt": a 1-2 sentence teaser in the story's own language, max 200 characters.
- "summary": for stories longer than ~120 words, a warm 2-3 sentence summary in the
  story's own language (max 500 characters) capturing what happens and why it matters;
  null for short stories.
- "translationEn": a faithful English translation of cleanedText, or null if the story
  is already in English.
- "tags": up to 4 lowercase tags, chosen from: childhood, family, love, lesson, regret,
  joy, memory, loss, courage, home.
- "containsContactInfo": true only if the text contains phone numbers, email addresses,
  street addresses, or similar contact details."""


class PipelineState(TypedDict, total=False):
    kind: str
    title_hint: str | None
    text: str | None
    audio_bytes: bytes | None
    audio_filename: str | None
    transcript: str | None
    language: str | None
    title: str | None
    cleaned_text: str
    excerpt: str | None
    summary: str | None
    translation_en: str | None
    tags: list[str]
    contains_contact_info: bool
    allowed: bool
    reason: str | None
    chunks: list[dict[str, Any]]


def _transcribe(state: PipelineState) -> PipelineState:
    audio = state.get("audio_bytes")
    if not audio:
        return {}
    settings = get_settings()
    client = Groq(api_key=settings.groq_api_key)
    filename = state.get("audio_filename") or "audio.webm"
    result = client.audio.transcriptions.create(
        file=(filename, io.BytesIO(audio)),
        model=settings.groq_whisper_model,
        response_format="verbose_json",
    )
    transcript = (result.text or "").strip()
    language = getattr(result, "language", None)
    logger.info("transcribed %d chars (language=%s)", len(transcript), language)
    existing = (state.get("text") or "").strip()
    return {
        "transcript": transcript,
        "text": existing or transcript,
        "language": language,
    }


def _analyze(state: PipelineState) -> PipelineState:
    text = (state.get("text") or "").strip()
    if not text:
        return {
            "cleaned_text": "",
            "allowed": False,
            "reason": "We couldn't hear anything in the recording — try again.",
        }

    settings = get_settings()
    llm = ChatGroq(
        api_key=settings.groq_api_key,
        model=settings.groq_model,
        temperature=0.2,
        model_kwargs={"response_format": {"type": "json_object"}},
    )
    hint = state.get("title_hint")
    user_content = (f"Title hint: {hint}\n\n" if hint else "") + f"Story:\n{text}"

    raw = llm.invoke([
        SystemMessage(content=ANALYZE_SYSTEM_PROMPT),
        HumanMessage(content=user_content),
    ]).content
    data = json.loads(raw if isinstance(raw, str) else str(raw))

    tags = [t for t in (data.get("tags") or []) if isinstance(t, str) and t.lower() in ALLOWED_TAGS]
    cleaned = (data.get("cleanedText") or text).strip()
    translation = data.get("translationEn")
    language = (data.get("language") or state.get("language") or "en").lower()[:10]
    if language == "en":
        translation = None

    return {
        "language": language,
        "title": (data.get("title") or hint or None),
        "cleaned_text": cleaned,
        "excerpt": data.get("excerpt"),
        "summary": data.get("summary") if isinstance(data.get("summary"), str) else None,
        "translation_en": translation.strip() if isinstance(translation, str) and translation.strip() else None,
        "tags": [t.lower() for t in tags][:4],
        "contains_contact_info": bool(data.get("containsContactInfo")),
    }


MODERATION_POLICY = """You are a content safety classifier for a personal life-story platform.

DISALLOWED (unsafe): sexual content involving minors; graphic violence or gore described
to shock; hate speech or harassment targeting a group or person; encouragement of
self-harm or suicide; instructions for illegal activity; spam, scams, or advertising.

ALLOWED (safe): personal memories with difficult themes — death, grief, illness, war
memories, loss, regret — told sincerely. These are the heart of the platform.

Respond with EXACTLY one line: either "safe" or "unsafe: <category>"."""


def _moderate(state: PipelineState) -> PipelineState:
    if state.get("allowed") is False:
        return {}
    if state.get("contains_contact_info"):
        return {
            "allowed": False,
            "reason": "This story contains contact details (phone/email/address). Remove them before sharing.",
        }

    content = state.get("translation_en") or state.get("cleaned_text") or ""
    if not content:
        return {"allowed": True, "reason": None}

    settings = get_settings()
    try:
        client = Groq(api_key=settings.groq_api_key)
        result = client.chat.completions.create(
            model=settings.groq_moderation_model,
            messages=[
                {"role": "system", "content": MODERATION_POLICY},
                {"role": "user", "content": content[:6000]},
            ],
            max_tokens=1024,
        )
        verdict = (result.choices[0].message.content or "").strip().lower()
        if "unsafe" in verdict:
            logger.warning("moderation flagged story: %s", verdict.replace("\n", " ")[:200])
            return {
                "allowed": False,
                "reason": "This story can't be shared publicly because it may contain harmful content.",
            }
        if "safe" in verdict:
            return {"allowed": True, "reason": None}
        logger.warning("moderation verdict unparseable: %s", verdict[:200])
        return {
            "allowed": False,
            "reason": "Safety review was inconclusive — the story is kept private for now.",
        }
    except Exception:  # guard model unavailable → fail CLOSED for public content
        logger.exception("moderation model unavailable")
        return {
            "allowed": False,
            "reason": "Safety review was unavailable — the story is kept private for now.",
        }


def _embed(state: PipelineState) -> PipelineState:
    texts: list[str] = []
    cleaned = state.get("cleaned_text") or ""
    if cleaned:
        texts.extend(chunk_text(cleaned))
    translation = state.get("translation_en")
    if translation:
        texts.extend(chunk_text(translation, max_chunks=4))
    if not texts:
        return {"chunks": []}
    vectors = embed_texts(texts)
    return {
        "chunks": [
            {"index": i, "text": t, "embedding": v}
            for i, (t, v) in enumerate(zip(texts, vectors))
        ]
    }


def translate_story(text: str, title: str | None, target_language: str) -> dict:
    """Faithful translation of a story (and its title) into the target language."""
    settings = get_settings()
    llm = ChatGroq(
        api_key=settings.groq_api_key,
        model=settings.groq_model,
        temperature=0.2,
        model_kwargs={"response_format": {"type": "json_object"}},
    )
    system = (
        "You translate personal life stories faithfully — keep the writer's voice, tone, "
        "names, and paragraph breaks. Return STRICT JSON with keys \"title\" (translated "
        "title, or null if no title given) and \"text\" (the translated story)."
    )
    user = (
        f"Target language ISO 639-1 code: {target_language}\n"
        + (f"Title: {title}\n" if title else "")
        + f"Story:\n{text[:12000]}"
    )
    raw = llm.invoke([SystemMessage(content=system), HumanMessage(content=user)]).content
    data = json.loads(raw if isinstance(raw, str) else str(raw))
    translated = (data.get("text") or "").strip()
    if not translated:
        raise ValueError("empty translation")
    return {"title": data.get("title"), "text": translated}


def build_graph():
    graph = StateGraph(PipelineState)
    graph.add_node("transcribe", _transcribe)
    graph.add_node("analyze", _analyze)
    graph.add_node("moderate", _moderate)
    graph.add_node("embed", _embed)
    graph.add_edge(START, "transcribe")
    graph.add_edge("transcribe", "analyze")
    graph.add_edge("analyze", "moderate")
    graph.add_edge("moderate", "embed")
    graph.add_edge("embed", END)
    return graph.compile()


story_pipeline = build_graph()
