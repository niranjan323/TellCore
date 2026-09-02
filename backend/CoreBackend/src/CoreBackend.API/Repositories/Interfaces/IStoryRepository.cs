using CoreBackend.API.Models.Entities;
using CoreBackend.API.Models.Responses;

namespace CoreBackend.API.Repositories.Interfaces;

/// <summary>Story row joined with its author's public fields.</summary>
public class StoryRow : Story
{
    public string? AuthorName { get; set; }
    public bool AuthorIsPublic { get; set; } = true;
}

public interface IStoryRepository
{
    Task InsertAsync(Story story, CancellationToken ct = default);
    Task<StoryRow?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task UpdateContentAsync(Story story, CancellationToken ct = default);
    Task UpdateStatusAsync(Guid storyId, string status, string? moderationReason, CancellationToken ct = default);
    Task UpdateProcessingResultAsync(Story story, CancellationToken ct = default);
    Task UpdateAudioAsync(Guid storyId, string audioUrl, string audioPath, int? durationSeconds, CancellationToken ct = default);
    Task SoftDeleteAsync(Guid storyId, Guid userId, CancellationToken ct = default);
    Task<int> CountForUserAsync(Guid userId, CancellationToken ct = default);
    Task<int> CountForUserSinceAsync(Guid userId, DateTime sinceUtc, CancellationToken ct = default);
    Task<IReadOnlyList<StoryRow>> GetMineAsync(Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<StoryRow>> GetCommunityFeedAsync(Guid productId, int page, int pageSize, CancellationToken ct = default);
    Task<IReadOnlyList<StoryRow>> GetFamilyStoriesAsync(IReadOnlyList<Guid> ownerUserIds, CancellationToken ct = default);

    Task<IReadOnlyDictionary<Guid, List<string>>> GetTagsAsync(IEnumerable<Guid> storyIds, CancellationToken ct = default);
    Task ReplaceTagsAsync(Guid storyId, IEnumerable<string> tags, Guid userId, CancellationToken ct = default);
    Task UpsertTranslationAsync(StoryTranslation translation, CancellationToken ct = default);
    Task ReplaceEmbeddingsAsync(Guid storyId, IReadOnlyList<AiEmbeddingChunk> chunks, CancellationToken ct = default);
    Task<IReadOnlyList<Guid>> SearchByVectorAsync(float[] queryEmbedding, Guid productId, Guid viewerUserId, int top, CancellationToken ct = default);
    Task<IReadOnlyList<Guid>> SearchByTextAsync(string query, Guid productId, Guid viewerUserId, int top, CancellationToken ct = default);
    Task<IReadOnlyList<StoryRow>> GetByIdsAsync(IReadOnlyList<Guid> ids, CancellationToken ct = default);

    Task RecordViewAsync(Guid storyId, Guid? viewerUserId, CancellationToken ct = default);
    /// <summary>False when this user already reported this story.</summary>
    Task<bool> TryInsertReportAsync(StoryReport report, CancellationToken ct = default);
    Task<int> CountDistinctReportsAsync(Guid storyId, CancellationToken ct = default);
    Task<bool> ToggleHeartAsync(Guid storyId, Guid userId, CancellationToken ct = default);
    Task<IReadOnlySet<Guid>> GetHeartedStoryIdsAsync(IEnumerable<Guid> storyIds, Guid userId, CancellationToken ct = default);

    Task<StoryRow?> GetFeaturedForDateAsync(Guid productId, DateTime dateUtc, CancellationToken ct = default);
    Task<StoryRow?> PickCommunityStoryForFeatureAsync(Guid productId, CancellationToken ct = default);
    Task InsertFeaturedAsync(Guid productId, Guid storyId, DateTime dateUtc, bool isManualPick, CancellationToken ct = default);
    Task SetIsFeaturedAsync(Guid storyId, bool isFeatured, CancellationToken ct = default);
}
