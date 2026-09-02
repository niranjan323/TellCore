using CoreBackend.API.Models.Entities;
using CoreBackend.API.Repositories.Interfaces;
using CoreBackend.API.Services.Interfaces;

namespace CoreBackend.API.Services;

/// <summary>
/// Runs one story through the AI pipeline: transcription (voice), language
/// detection, cleanup, moderation, English translation, tags, embeddings.
/// When the pipeline is unavailable the story still publishes with its raw
/// text — except community stories, which are kept private because they
/// cannot go public unmoderated.
/// </summary>
public class StoryProcessingService : IStoryProcessingService
{
    private readonly IStoryRepository _stories;
    private readonly IFamilyRepository _family;
    private readonly INotificationRepository _notifications;
    private readonly IAiPipelineClient _aiClient;
    private readonly IFileStorageService _storage;
    private readonly ILogger<StoryProcessingService> _logger;

    public StoryProcessingService(
        IStoryRepository stories,
        IFamilyRepository family,
        INotificationRepository notifications,
        IAiPipelineClient aiClient,
        IFileStorageService storage,
        ILogger<StoryProcessingService> logger)
    {
        _stories = stories;
        _family = family;
        _notifications = notifications;
        _aiClient = aiClient;
        _storage = storage;
        _logger = logger;
    }

    public async Task ProcessAsync(Guid storyId, CancellationToken ct = default)
    {
        var story = await _stories.GetByIdAsync(storyId, ct);
        if (story is null || story.IsDeleted) return;

        Models.Responses.AiPipelineResult? result = null;
        Stream? audio = null;
        try
        {
            if (story.Kind == "voice" && !string.IsNullOrEmpty(story.AudioPath))
                audio = await _storage.OpenReadAsync(story.AudioPath, ct);

            result = await _aiClient.ProcessStoryAsync(
                story.RawText, audio, Path.GetFileName(story.AudioPath), story.Kind, story.Title, ct);
        }
        finally
        {
            if (audio is not null) await audio.DisposeAsync();
        }

        if (result is null)
        {
            await ApplyFallbackAsync(story, ct);
            return;
        }

        story.OriginalLanguage = result.Language;
        if (!string.IsNullOrWhiteSpace(result.Transcript) && string.IsNullOrWhiteSpace(story.RawText))
            story.RawText = result.Transcript;
        if (!string.IsNullOrWhiteSpace(result.CleanedText))
            story.ContentText = result.CleanedText;
        if (string.IsNullOrWhiteSpace(story.Title) && !string.IsNullOrWhiteSpace(result.Title))
            story.Title = result.Title;
        story.Excerpt = !string.IsNullOrWhiteSpace(result.Excerpt)
            ? result.Excerpt
            : TextUtils.MakeExcerpt(story.ContentText);
        story.Summary = string.IsNullOrWhiteSpace(result.Summary) ? null : result.Summary.Trim();
        story.WordCount = result.WordCount > 0 ? result.WordCount : TextUtils.CountWords(story.ContentText);

        if (story.Visibility != "private" && !result.Moderation.Allowed)
        {
            story.Status = "flagged";
            story.ModerationReason = result.Moderation.Reason ?? "This story can't be shared publicly.";
            story.PublishedAt = null;
        }
        else
        {
            story.Status = "published";
            story.ModerationReason = null;
            story.PublishedAt = DateTime.UtcNow;
        }

        await _stories.UpdateProcessingResultAsync(story, ct);

        if (result.Tags.Count > 0)
        {
            var existing = await _stories.GetTagsAsync(new[] { story.Id }, ct);
            var merged = (existing.TryGetValue(story.Id, out var current) ? current : new List<string>())
                .Concat(result.Tags).ToList();
            await _stories.ReplaceTagsAsync(story.Id, merged, story.UserId, ct);
        }

        if (!string.IsNullOrWhiteSpace(result.TranslationEn) &&
            !string.Equals(result.Language, "en", StringComparison.OrdinalIgnoreCase))
        {
            await _stories.UpsertTranslationAsync(new StoryTranslation
            {
                StoryId = story.Id,
                LanguageCode = "en",
                Title = story.Title,
                ContentText = result.TranslationEn,
                Excerpt = TextUtils.MakeExcerpt(result.TranslationEn),
                IsAiGenerated = true,
            }, ct);
        }

        if (result.Chunks.Count > 0)
        {
            try
            {
                await _stories.ReplaceEmbeddingsAsync(story.Id, result.Chunks, ct);
            }
            catch (Exception ex)
            {
                // Embeddings are an enhancement — never fail publication over them.
                _logger.LogWarning(ex, "Failed to store embeddings for story {StoryId}", story.Id);
            }
        }

        if (story.Status == "published" && story.Visibility == "family")
            await NotifyFamilyAsync(story, ct);

        _logger.LogInformation("Story {StoryId} processed: status={Status}, lang={Lang}", story.Id, story.Status, story.OriginalLanguage);
    }

    private async Task ApplyFallbackAsync(StoryRow story, CancellationToken ct)
    {
        story.ContentText ??= story.RawText;
        story.Excerpt ??= TextUtils.MakeExcerpt(story.ContentText);
        story.WordCount = story.WordCount > 0 ? story.WordCount : TextUtils.CountWords(story.ContentText);

        if (story.Visibility == "community")
        {
            // Unmoderated content never goes public.
            story.Visibility = "private";
            story.ModerationReason = "AI review was unavailable — your story is saved privately. Publish it again later.";
        }
        story.Status = "published";
        story.PublishedAt = DateTime.UtcNow;
        await _stories.UpdateProcessingResultAsync(story, ct);

        if (story.Visibility == "family")
            await NotifyFamilyAsync(story, ct);

        _logger.LogWarning("Story {StoryId} published via fallback (AI pipeline unavailable)", story.Id);
    }

    private async Task NotifyFamilyAsync(Story story, CancellationToken ct)
    {
        try
        {
            var members = await _family.GetMembersAsync(story.UserId, ct);
            foreach (var member in members.Where(m => m.MemberUserId is not null && m.Status == "active"))
            {
                await _notifications.InsertAsync(new Notification
                {
                    UserId = member.MemberUserId!.Value,
                    Kind = "family-shared",
                    Title = "A new story in your family vault",
                    Body = $"\"{story.Title ?? "A story"}\" was added to the vault.",
                    LinkRoute = $"/story/{story.Id}",
                }, ct);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to notify family for story {StoryId}", story.Id);
        }
    }
}
