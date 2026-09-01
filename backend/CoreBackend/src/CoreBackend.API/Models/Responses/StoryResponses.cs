namespace CoreBackend.API.Models.Responses;

public record AuthorResponse(Guid Id, string Name, string? AvatarUrl, string Initials);

/// <summary>
/// Matches the frontend Story contract, extended with server-side gating fields
/// (isPreview / isMine / status / viewCount). Body carries the preview text when
/// IsPreview is true; AudioUrl is null for non-paid viewers of community stories.
/// </summary>
public record StoryResponse(
    Guid Id,
    AuthorResponse Author,
    string Title,
    string Excerpt,
    string Body,
    string Kind,
    string? AudioUrl,
    int? DurationSeconds,
    int WordCount,
    IReadOnlyList<string> Tags,
    DateTime CreatedAt,
    string? PromptKey,
    bool IsFeatured,
    int HeartCount,
    string Visibility,
    int ViewCount,
    string Status,
    string? ModerationReason,
    string? OriginalLanguage,
    bool IsPreview,
    bool IsMine,
    bool HasHearted);

public record StoryListResponse(IReadOnlyList<StoryResponse> Stories, int Page, int PageSize, bool HasMore);

public record CreateStoryResponse(Guid StoryId, string Status);

public record StoryStatusResponse(Guid StoryId, string Status, string? ModerationReason);

public record StoryVoiceUploadResponse(string AudioUrl, int? DurationSeconds);

public record HeartResponse(int HeartCount, bool HasHearted);
