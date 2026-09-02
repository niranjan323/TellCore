using CoreBackend.API.Models.Entities;
using CoreBackend.API.Models.Requests;
using CoreBackend.API.Models.Responses;
using CoreBackend.API.Repositories.Interfaces;
using CoreBackend.API.Services.Interfaces;

namespace CoreBackend.API.Services;

public class StoryService : IStoryService
{
    private static readonly string[] ValidKinds = { "text", "voice" };
    private static readonly string[] ValidVisibilities = { "private", "family", "community" };
    private const string AnonymousAuthorName = "A storyteller";

    private readonly IStoryRepository _stories;
    private readonly IProductRepository _products;
    private readonly IUserRepository _users;
    private readonly IFamilyRepository _family;
    private readonly ISettingsRepository _settings;
    private readonly IProfileService _profile;
    private readonly IStoryProcessingQueue _queue;
    private readonly IFileStorageService _storage;
    private readonly INotificationRepository _notifications;
    private readonly IAiPipelineClient _aiClient;
    private readonly ILogger<StoryService> _logger;

    public StoryService(
        IStoryRepository stories,
        IProductRepository products,
        IUserRepository users,
        IFamilyRepository family,
        ISettingsRepository settings,
        IProfileService profile,
        IStoryProcessingQueue queue,
        IFileStorageService storage,
        INotificationRepository notifications,
        IAiPipelineClient aiClient,
        ILogger<StoryService> logger)
    {
        _stories = stories;
        _products = products;
        _users = users;
        _family = family;
        _settings = settings;
        _profile = profile;
        _queue = queue;
        _storage = storage;
        _notifications = notifications;
        _aiClient = aiClient;
        _logger = logger;
    }

    public async Task<(CreateStoryResponse? Result, string? Error)> CreateAsync(Guid userId, string userType, CreateStoryRequest request, CancellationToken ct = default)
    {
        if (!ValidKinds.Contains(request.Kind)) return (null, "invalid_kind");
        if (!ValidVisibilities.Contains(request.Visibility)) return (null, "invalid_visibility");
        if (request.Kind == "text" && string.IsNullOrWhiteSpace(request.Text)) return (null, "invalid_text");

        var product = await _products.GetBySlugAsync(request.ProductSlug, ct);
        if (product is null) return (null, "not_found");

        if (userType != "paid")
        {
            // Free tier writes at the app's natural rhythm: one page a day.
            var perDaySetting = await _settings.GetValueAsync("stories.free.perday", ct: ct);
            var perDay = int.TryParse(perDaySetting, out var pd) && pd > 0 ? pd : 1;
            var todayCount = await _stories.CountForUserSinceAsync(userId, DateTime.UtcNow.Date, ct);
            if (todayCount >= perDay) return (null, "daily_limit_reached");
        }

        var story = new Story
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ProductId = product.Id,
            Title = string.IsNullOrWhiteSpace(request.Title) ? null : request.Title.Trim(),
            Kind = request.Kind,
            RawText = request.Text,
            ContentText = request.Text,
            Excerpt = TextUtils.MakeExcerpt(request.Text),
            WordCount = TextUtils.CountWords(request.Text),
            Visibility = request.Visibility,
            Status = "draft",
            PromptKey = request.PromptKey,
        };
        await _stories.InsertAsync(story, ct);
        if (request.Tags.Count > 0)
            await _stories.ReplaceTagsAsync(story.Id, request.Tags, userId, ct);

        await _profile.RecordEntryAsync(userId, ct);
        return (new CreateStoryResponse(story.Id, story.Status), null);
    }

    public async Task<(StoryVoiceUploadResponse? Result, string? Error)> AttachVoiceAsync(Guid userId, Guid storyId, Stream content, string fileName, string contentType, int? durationSeconds, CancellationToken ct = default)
    {
        var story = await _stories.GetByIdAsync(storyId, ct);
        if (story is null) return (null, "not_found");
        if (story.UserId != userId) return (null, "forbidden");

        var stored = await _storage.SaveAsync(content, fileName, contentType, $"stories/{storyId:N}", ct);
        await _stories.UpdateAudioAsync(storyId, stored.Url, stored.RelativePath, durationSeconds, ct);
        return (new StoryVoiceUploadResponse(stored.Url, durationSeconds), null);
    }

    public async Task<string?> StartProcessingAsync(Guid userId, Guid storyId, CancellationToken ct = default)
    {
        var story = await _stories.GetByIdAsync(storyId, ct);
        if (story is null) return "not_found";
        if (story.UserId != userId) return "forbidden";
        if (story.Status == "processing") return null;
        if (story.Kind == "voice" && string.IsNullOrEmpty(story.AudioPath) && string.IsNullOrWhiteSpace(story.RawText))
            return "invalid_no_audio";

        await _stories.UpdateStatusAsync(storyId, "processing", null, ct);
        _queue.Enqueue(storyId);
        return null;
    }

    public async Task<StoryStatusResponse?> GetStatusAsync(Guid userId, Guid storyId, CancellationToken ct = default)
    {
        var story = await _stories.GetByIdAsync(storyId, ct);
        if (story is null || story.UserId != userId) return null;
        return new StoryStatusResponse(story.Id, story.Status, story.ModerationReason);
    }

    public async Task<IReadOnlyList<StoryResponse>> GetMineAsync(Guid userId, CancellationToken ct = default)
    {
        var rows = await _stories.GetMineAsync(userId, ct);
        return await MapManyAsync(rows, userId, viewerHasFullAccess: true, ct);
    }

    public async Task<(StoryResponse? Story, string? Error)> GetByIdAsync(Guid viewerId, string viewerType, Guid storyId, CancellationToken ct = default)
    {
        var row = await _stories.GetByIdAsync(storyId, ct);
        if (row is null) return (null, "not_found");

        var isMine = row.UserId == viewerId;
        var familyAccess = false;

        if (!isMine)
        {
            switch (row.Visibility)
            {
                case "private":
                    return (null, "not_found");
                case "family":
                    familyAccess = await _family.IsMemberAsync(row.UserId, viewerId, ct);
                    if (!familyAccess || row.Status != "published") return (null, "not_found");
                    break;
                default: // community
                    if (row.Status != "published") return (null, "not_found");
                    familyAccess = await _family.IsMemberAsync(row.UserId, viewerId, ct);
                    break;
            }
        }

        var fullAccess = isMine || familyAccess || viewerType == "paid";
        var mapped = await MapManyAsync(new[] { row }, viewerId, fullAccess, ct);
        return (mapped[0], null);
    }

    public async Task<(StoryResponse? Story, string? Error)> UpdateAsync(Guid userId, Guid storyId, UpdateStoryRequest request, CancellationToken ct = default)
    {
        var story = await _stories.GetByIdAsync(storyId, ct);
        if (story is null) return (null, "not_found");
        if (story.UserId != userId) return (null, "forbidden");
        if (request.Visibility is not null && !ValidVisibilities.Contains(request.Visibility))
            return (null, "invalid_visibility");

        var visibilityWidened = request.Visibility is not null &&
            request.Visibility != story.Visibility && request.Visibility != "private";
        var textChanged = request.Text is not null && request.Text != story.RawText;

        if (request.Title is not null) story.Title = request.Title.Trim();
        if (request.Text is not null)
        {
            story.RawText = request.Text;
            story.ContentText = request.Text;
            story.Excerpt = TextUtils.MakeExcerpt(request.Text);
            story.WordCount = TextUtils.CountWords(request.Text);
        }
        if (request.Visibility is not null) story.Visibility = request.Visibility;

        // Widening exposure or changing text sends the story back through moderation.
        if ((visibilityWidened || textChanged) && story.Visibility != "private")
        {
            story.Status = "processing";
            story.ModerationReason = null;
        }

        await _stories.UpdateContentAsync(story, ct);
        if (request.Tags is not null)
            await _stories.ReplaceTagsAsync(storyId, request.Tags, userId, ct);
        if (story.Status == "processing")
            _queue.Enqueue(storyId);

        var mapped = await MapManyAsync(new[] { story }, userId, true, ct);
        return (mapped[0], null);
    }

    public async Task<string?> DeleteAsync(Guid userId, Guid storyId, CancellationToken ct = default)
    {
        var story = await _stories.GetByIdAsync(storyId, ct);
        if (story is null) return "not_found";
        if (story.UserId != userId) return "forbidden";
        await _stories.SoftDeleteAsync(storyId, userId, ct);
        return null;
    }

    public Task RecordViewAsync(Guid storyId, Guid? viewerUserId, CancellationToken ct = default)
        => _stories.RecordViewAsync(storyId, viewerUserId, ct);

    private static readonly string[] ValidReportReasons = { "harmful", "spam", "private-info", "plagiarism", "other" };

    public async Task<string?> ReportAsync(Guid userId, Guid storyId, string reason, string? details, CancellationToken ct = default)
    {
        if (!ValidReportReasons.Contains(reason)) return "invalid_reason";
        var story = await _stories.GetByIdAsync(storyId, ct);
        if (story is null) return "not_found";
        if (story.UserId == userId) return "report_own";

        var isNew = await _stories.TryInsertReportAsync(new StoryReport
        {
            StoryId = storyId,
            ReporterUserId = userId,
            Reason = reason,
            Details = string.IsNullOrWhiteSpace(details) ? null : details.Trim(),
        }, ct);
        if (!isNew) return "already_reported";

        // Enough distinct reports → pull the story from circulation pending review.
        var thresholdSetting = await _settings.GetValueAsync("stories.reports.autohide", ct: ct);
        var threshold = int.TryParse(thresholdSetting, out var t) && t > 0 ? t : 3;
        var reportCount = await _stories.CountDistinctReportsAsync(storyId, ct);
        if (reportCount >= threshold && story.Status == "published")
        {
            await _stories.UpdateStatusAsync(storyId, "flagged",
                "This story is under review after reader reports.", ct);
            _logger.LogWarning("Story {StoryId} auto-hidden after {Count} reports", storyId, reportCount);
        }
        return null;
    }

    public async Task<HeartResponse?> ToggleHeartAsync(Guid userId, Guid storyId, CancellationToken ct = default)
    {
        var story = await _stories.GetByIdAsync(storyId, ct);
        if (story is null) return null;
        var hearted = await _stories.ToggleHeartAsync(storyId, userId, ct);
        var refreshed = await _stories.GetByIdAsync(storyId, ct);
        return new HeartResponse(refreshed?.HeartCount ?? story.HeartCount, hearted);
    }

    public async Task<FavouriteResponse?> ToggleFavouriteAsync(Guid userId, Guid storyId, CancellationToken ct = default)
    {
        var story = await _stories.GetByIdAsync(storyId, ct);
        if (story is null) return null;
        var favourited = await _stories.ToggleFavouriteAsync(storyId, userId, ct);
        return new FavouriteResponse(favourited);
    }

    public async Task<IReadOnlyList<StoryResponse>> GetLikedAsync(Guid userId, string userType, CancellationToken ct = default)
    {
        var rows = await _stories.GetHeartedByUserAsync(userId, ct);
        return await MapManyAsync(rows, userId, userType == "paid", ct);
    }

    public async Task<IReadOnlyList<StoryResponse>> GetFavouritesAsync(Guid userId, string userType, CancellationToken ct = default)
    {
        var rows = await _stories.GetFavouritedByUserAsync(userId, ct);
        return await MapManyAsync(rows, userId, userType == "paid", ct);
    }

    public async Task<(StoryTranslationResponse? Result, string? Error)> GetTranslationAsync(
        Guid viewerId, string viewerType, Guid storyId, string languageCode, CancellationToken ct = default)
    {
        languageCode = languageCode.Trim().ToLowerInvariant();
        if (languageCode.Length is < 2 or > 10) return (null, "invalid_language");

        // Same visibility rules as reading the story itself.
        var (mapped, error) = await GetByIdAsync(viewerId, viewerType, storyId, ct);
        if (mapped is null) return (null, error ?? "not_found");

        if (string.Equals(mapped.OriginalLanguage ?? "en", languageCode, StringComparison.OrdinalIgnoreCase))
            return (new StoryTranslationResponse(storyId, languageCode, mapped.Title, mapped.Body, mapped.IsPreview, false), null);

        string? title;
        string body;
        var cached = await _stories.GetTranslationAsync(storyId, languageCode, ct);
        if (cached is not null)
        {
            title = cached.Title;
            body = cached.ContentText;
        }
        else
        {
            var row = await _stories.GetByIdAsync(storyId, ct);
            var source = row?.ContentText ?? row?.RawText;
            if (row is null || string.IsNullOrWhiteSpace(source)) return (null, "translation_unavailable");

            var result = await _aiClient.TranslateAsync(source, row.Title, languageCode, ct);
            if (result is null || string.IsNullOrWhiteSpace(result.Text)) return (null, "translation_unavailable");

            title = result.Title ?? row.Title;
            body = result.Text.Trim();
            await _stories.UpsertTranslationAsync(new StoryTranslation
            {
                StoryId = storyId,
                LanguageCode = languageCode,
                Title = title,
                ContentText = body,
                Excerpt = TextUtils.MakeExcerpt(body),
                IsAiGenerated = true,
            }, ct);
        }

        if (mapped.IsPreview)
        {
            var previewCharsSetting = await _settings.GetValueAsync("stories.preview.chars", ct: ct);
            var previewChars = int.TryParse(previewCharsSetting, out var pc) && pc > 0 ? pc : 600;
            if (body.Length > previewChars) body = TextUtils.TruncateAtWord(body, previewChars);
        }

        return (new StoryTranslationResponse(storyId, languageCode, title, body, mapped.IsPreview, true), null);
    }

    public async Task<StoryListResponse> GetCommunityFeedAsync(string productSlug, Guid viewerId, string viewerType, int page, int pageSize, CancellationToken ct = default)
    {
        var product = await _products.GetBySlugAsync(productSlug, ct);
        if (product is null) return new StoryListResponse(Array.Empty<StoryResponse>(), page, pageSize, false);

        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);
        var rows = await _stories.GetCommunityFeedAsync(product.Id, page, pageSize + 1, ct);
        var hasMore = rows.Count > pageSize;
        var pageRows = hasMore ? rows.Take(pageSize).ToList() : rows.ToList();
        var mapped = await MapManyAsync(pageRows, viewerId, viewerType == "paid", ct);
        return new StoryListResponse(mapped, page, pageSize, hasMore);
    }

    public async Task<StoryResponse?> GetStoryOfTheDayAsync(string productSlug, Guid viewerId, string viewerType, CancellationToken ct = default)
    {
        var product = await _products.GetBySlugAsync(productSlug, ct);
        if (product is null) return null;

        var today = DateTime.UtcNow.Date;
        var row = await _stories.GetFeaturedForDateAsync(product.Id, today, ct);
        if (row is null)
        {
            // Lazy daily pick: first request of the day selects and records it.
            row = await _stories.PickCommunityStoryForFeatureAsync(product.Id, ct);
            if (row is null) return null;
            await _stories.InsertFeaturedAsync(product.Id, row.Id, today, isManualPick: false, ct);
            await _stories.SetIsFeaturedAsync(row.Id, true, ct);
            row.IsFeatured = true;
            try
            {
                await _notifications.InsertAsync(new Notification
                {
                    UserId = row.UserId,
                    Kind = "story-featured",
                    Title = "Your story was featured",
                    Body = $"\"{row.Title ?? "Your story"}\" is on the community page today.",
                    LinkRoute = $"/story/{row.Id}",
                }, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to write featured notification for story {StoryId}", row.Id);
            }
        }

        var isMine = row.UserId == viewerId;
        var mapped = await MapManyAsync(new[] { row }, viewerId, isMine || viewerType == "paid", ct);
        return mapped[0];
    }

    public async Task<IReadOnlyList<StoryResponse>> SearchAsync(string productSlug, Guid viewerId, string viewerType, string query, CancellationToken ct = default)
    {
        var product = await _products.GetBySlugAsync(productSlug, ct);
        if (product is null || string.IsNullOrWhiteSpace(query)) return Array.Empty<StoryResponse>();

        IReadOnlyList<Guid> ids;
        var embedding = await _aiClient.EmbedQueryAsync(query.Trim(), ct);
        if (embedding is { Length: > 0 })
        {
            ids = await _stories.SearchByVectorAsync(embedding, product.Id, viewerId, 20, ct);
        }
        else
        {
            // Pipeline unavailable → plain text match so search still works.
            ids = await _stories.SearchByTextAsync(query.Trim(), product.Id, viewerId, 20, ct);
        }

        var rows = await _stories.GetByIdsAsync(ids, ct);
        return await MapManyAsync(rows, viewerId, viewerType == "paid", ct);
    }

    public async Task<IReadOnlyList<StoryResponse>> GetFamilyStoriesForOwnersAsync(IReadOnlyList<Guid> ownerIds, Guid viewerId, CancellationToken ct = default)
    {
        var rows = await _stories.GetFamilyStoriesAsync(ownerIds, ct);
        // Vault membership grants full access to everything listed here.
        return await MapManyAsync(rows, viewerId, viewerHasFullAccess: true, ct);
    }

    // ── Mapping ──────────────────────────────────────────────────────────────

    private async Task<IReadOnlyList<StoryResponse>> MapManyAsync(
        IReadOnlyList<StoryRow> rows, Guid viewerId, bool viewerHasFullAccess, CancellationToken ct)
    {
        if (rows.Count == 0) return Array.Empty<StoryResponse>();

        var ids = rows.Select(r => r.Id).ToList();
        var tagsByStory = await _stories.GetTagsAsync(ids, ct);
        var hearted = viewerId == Guid.Empty
            ? (IReadOnlySet<Guid>)new HashSet<Guid>()
            : await _stories.GetHeartedStoryIdsAsync(ids, viewerId, ct);
        var favourited = viewerId == Guid.Empty
            ? (IReadOnlySet<Guid>)new HashSet<Guid>()
            : await _stories.GetFavouritedStoryIdsAsync(ids, viewerId, ct);

        var previewCharsSetting = await _settings.GetValueAsync("stories.preview.chars", ct: ct);
        var previewChars = int.TryParse(previewCharsSetting, out var pc) && pc > 0 ? pc : 600;

        return rows.Select(row =>
        {
            var isMine = row.UserId == viewerId;
            var fullAccess = viewerHasFullAccess || isMine;
            var body = row.ContentText ?? row.RawText ?? string.Empty;
            var isPreview = false;
            var audioUrl = row.AudioUrl;

            if (!fullAccess && row.Visibility == "community")
            {
                if (body.Length > previewChars)
                {
                    body = TextUtils.TruncateAtWord(body, previewChars);
                    isPreview = true;
                }
                if (audioUrl is not null)
                {
                    audioUrl = null;      // audio playback is a premium feature
                    isPreview = true;
                }
            }

            var showAuthor = row.AuthorIsPublic || isMine;
            var authorName = showAuthor && !string.IsNullOrWhiteSpace(row.AuthorName) ? row.AuthorName! : AnonymousAuthorName;

            return new StoryResponse(
                row.Id,
                new AuthorResponse(row.UserId, authorName, null, TextUtils.Initials(authorName)),
                row.Title ?? "Untitled story",
                row.Excerpt ?? TextUtils.MakeExcerpt(body),
                row.Summary,
                body,
                row.Kind,
                audioUrl,
                row.DurationSeconds,
                row.WordCount,
                tagsByStory.TryGetValue(row.Id, out var tags) ? tags : new List<string>(),
                row.CreatedAt,
                row.PromptKey,
                row.IsFeatured,
                row.HeartCount,
                row.Visibility,
                row.ViewCount,
                row.Status,
                isMine ? row.ModerationReason : null,
                row.OriginalLanguage,
                isPreview,
                isMine,
                hearted.Contains(row.Id),
                favourited.Contains(row.Id));
        }).ToList();
    }
}
