namespace CoreBackend.API.Models.Responses;

// ── Contracts between CoreBackend and the internal FastAPI AI pipeline ──────
// (services/ai). The pipeline transcribes voice, detects language, cleans the
// text, moderates it, translates to English, tags it, and returns embeddings.

public class AiPipelineResult
{
    public string? Language { get; set; }
    public string? Title { get; set; }
    public string? Transcript { get; set; }
    public string CleanedText { get; set; } = string.Empty;
    public string? Excerpt { get; set; }
    public string? TranslationEn { get; set; }
    public List<string> Tags { get; set; } = new();
    public AiModerationResult Moderation { get; set; } = new();
    public int WordCount { get; set; }
    public List<AiEmbeddingChunk> Chunks { get; set; } = new();
}

public class AiModerationResult
{
    public bool Allowed { get; set; } = true;
    public string? Reason { get; set; }
}

public class AiEmbeddingChunk
{
    public int Index { get; set; }
    public string Text { get; set; } = string.Empty;
    public float[] Embedding { get; set; } = Array.Empty<float>();
}

public class AiEmbedQueryResult
{
    public float[] Embedding { get; set; } = Array.Empty<float>();
}
