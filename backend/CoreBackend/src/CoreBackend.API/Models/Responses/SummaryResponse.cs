namespace CoreBackend.API.Models.Responses;

public record SummaryResponse(
    Guid SessionId,
    string Title,
    string? Subtitle,
    string? Disclaimer,
    IReadOnlyList<SummarySection> Sections,
    bool IsAiGenerated,
    DateTime GeneratedAt);

public record SummarySection(
    string Key,
    string Title,
    string Body,
    int Order);

public record SessionHistoryItem(
    Guid SessionId,
    string ProductSlug,
    string FormSetSlug,
    string LanguageCode,
    string Status,
    string? Title,
    DateTime CreatedAt,
    DateTime? CompletedAt);

public record SessionHistoryResponse(IReadOnlyList<SessionHistoryItem> Sessions);
