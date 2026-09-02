using CoreBackend.API.Models.Responses;

namespace CoreBackend.API.Services.Interfaces;

/// <summary>
/// Client for the internal FastAPI AI pipeline (services/ai).
/// Both methods return null when the pipeline is unavailable or declines —
/// callers must degrade gracefully (raw text kept, LIKE-based search fallback).
/// </summary>
public interface IAiPipelineClient
{
    Task<AiPipelineResult?> ProcessStoryAsync(
        string? text, Stream? audio, string? audioFileName, string kind, string? titleHint,
        CancellationToken ct = default);

    Task<float[]?> EmbedQueryAsync(string query, CancellationToken ct = default);

    Task<AiTranslateResult?> TranslateAsync(string text, string? title, string targetLanguage, CancellationToken ct = default);
}
