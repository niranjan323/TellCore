using CoreBackend.API.Models.Entities;
using CoreBackend.API.Models.Responses;
using CoreBackend.API.Repositories.Interfaces;
using CoreBackend.API.Services.Interfaces;

namespace CoreBackend.API.Services;

public class ProfileService : IProfileService
{
    private readonly IProfileRepository _profile;
    private readonly IUserRepository _users;

    public ProfileService(IProfileRepository profile, IUserRepository users)
    {
        _profile = profile;
        _users = users;
    }

    public Task SetProfileVisibilityAsync(Guid userId, bool isProfilePublic, CancellationToken ct = default)
        => _users.SetProfileVisibilityAsync(userId, isProfilePublic, ct);

    public async Task RecordEntryAsync(Guid userId, CancellationToken ct = default)
    {
        var today = DateTime.UtcNow.Date;
        var streak = await _profile.GetStreakAsync(userId, ct) ?? new Streak { UserId = userId };

        if (streak.LastEntryDate?.Date == today) return;

        streak.CurrentStreak = streak.LastEntryDate?.Date == today.AddDays(-1)
            ? streak.CurrentStreak + 1
            : 1;
        streak.LongestStreak = Math.Max(streak.LongestStreak, streak.CurrentStreak);
        streak.LastEntryDate = today;
        await _profile.UpsertStreakAsync(streak, ct);
    }

    public async Task<StreakResponse> GetStreakAsync(Guid userId, CancellationToken ct = default)
    {
        var today = DateTime.UtcNow.Date;
        var streak = await _profile.GetStreakAsync(userId, ct);

        // A streak older than yesterday has lapsed — display zero, keep longest.
        var current = streak is null ? 0
            : streak.LastEntryDate?.Date >= today.AddDays(-1) ? streak.CurrentStreak
            : 0;

        var dates = await _profile.GetStoryDatesSinceAsync(userId, today.AddDays(-6), ct);
        var dateSet = dates.Select(d => d.Date).ToHashSet();
        var week = Enumerable.Range(0, 7)
            .Select(i => dateSet.Contains(today.AddDays(i - 6)))
            .ToList();

        return new StreakResponse(current, streak?.LongestStreak ?? 0, week,
            streak?.LastEntryDate);
    }

    public async Task<ProfileStatsResponse> GetStatsAsync(Guid userId, CancellationToken ct = default)
    {
        var stats = await _profile.GetStatsAsync(userId, ct);
        return new ProfileStatsResponse(stats.TotalStories, stats.DaysActive, stats.WordsWritten, stats.FeaturedCount);
    }

    public async Task<IReadOnlyList<MilestoneResponse>> GetMilestonesAsync(Guid userId, CancellationToken ct = default)
    {
        var data = await _profile.GetMilestoneDataAsync(userId, ct);
        var streak = await _profile.GetStreakAsync(userId, ct);

        var streak7At = streak is { LongestStreak: >= 7 } ? streak.LastEntryDate : null;
        var streakActive = streak is { CurrentStreak: >= 7 } &&
            streak.LastEntryDate?.Date >= DateTime.UtcNow.Date.AddDays(-1);

        return new List<MilestoneResponse>
        {
            new("first-story", "Wrote your first story", data.FirstStoryAt, "pen-line", false),
            new("streak-7", "7-day streak achieved", streak7At, "flame", streakActive),
            new("featured", "A story was featured", data.FirstFeaturedAt, "sparkles", false),
            new("voice-first", "Recorded a voice story", data.FirstVoiceAt, "mic", false),
        };
    }
}
