using CoreBackend.API.Models.Requests;
using CoreBackend.API.Models.Responses;

namespace CoreBackend.API.Services.Interfaces;

/// <summary>
/// Error codes returned by story operations. Controllers map these to HTTP:
/// not_found → 404, forbidden → 403, story_limit_reached → 403 (with code),
/// invalid_* → 400.
/// </summary>
public interface IStoryService
{
    Task<(CreateStoryResponse? Result, string? Error)> CreateAsync(Guid userId, string userType, CreateStoryRequest request, CancellationToken ct = default);
    Task<(StoryVoiceUploadResponse? Result, string? Error)> AttachVoiceAsync(Guid userId, Guid storyId, Stream content, string fileName, string contentType, int? durationSeconds, CancellationToken ct = default);
    Task<string?> StartProcessingAsync(Guid userId, Guid storyId, CancellationToken ct = default);
    Task<StoryStatusResponse?> GetStatusAsync(Guid userId, Guid storyId, CancellationToken ct = default);
    Task<IReadOnlyList<StoryResponse>> GetMineAsync(Guid userId, CancellationToken ct = default);
    Task<(StoryResponse? Story, string? Error)> GetByIdAsync(Guid viewerId, string viewerType, Guid storyId, CancellationToken ct = default);
    Task<(StoryResponse? Story, string? Error)> UpdateAsync(Guid userId, Guid storyId, UpdateStoryRequest request, CancellationToken ct = default);
    Task<string?> DeleteAsync(Guid userId, Guid storyId, CancellationToken ct = default);
    Task RecordViewAsync(Guid storyId, Guid? viewerUserId, CancellationToken ct = default);
    /// <summary>Error codes: not_found, report_own, invalid_reason, already_reported.</summary>
    Task<string?> ReportAsync(Guid userId, Guid storyId, string reason, string? details, CancellationToken ct = default);
    Task<HeartResponse?> ToggleHeartAsync(Guid userId, Guid storyId, CancellationToken ct = default);
    Task<FavouriteResponse?> ToggleFavouriteAsync(Guid userId, Guid storyId, CancellationToken ct = default);
    Task<IReadOnlyList<StoryResponse>> GetLikedAsync(Guid userId, string userType, CancellationToken ct = default);
    Task<IReadOnlyList<StoryResponse>> GetFavouritesAsync(Guid userId, string userType, CancellationToken ct = default);
    /// <summary>Error codes: not_found, invalid_language, translation_unavailable.</summary>
    Task<(StoryTranslationResponse? Result, string? Error)> GetTranslationAsync(Guid viewerId, string viewerType, Guid storyId, string languageCode, CancellationToken ct = default);
    Task<StoryListResponse> GetCommunityFeedAsync(string productSlug, Guid viewerId, string viewerType, int page, int pageSize, CancellationToken ct = default);
    Task<StoryResponse?> GetStoryOfTheDayAsync(string productSlug, Guid viewerId, string viewerType, CancellationToken ct = default);
    Task<IReadOnlyList<StoryResponse>> SearchAsync(string productSlug, Guid viewerId, string viewerType, string query, CancellationToken ct = default);
    Task<IReadOnlyList<StoryResponse>> GetFamilyStoriesForOwnersAsync(IReadOnlyList<Guid> ownerIds, Guid viewerId, CancellationToken ct = default);
}
