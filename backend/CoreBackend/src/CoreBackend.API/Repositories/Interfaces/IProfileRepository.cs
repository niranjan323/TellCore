using CoreBackend.API.Models.Entities;

namespace CoreBackend.API.Repositories.Interfaces;

public class ProfileStatsRow
{
    public int TotalStories { get; set; }
    public int DaysActive { get; set; }
    public int WordsWritten { get; set; }
    public int FeaturedCount { get; set; }
}

public class MilestoneDataRow
{
    public DateTime? FirstStoryAt { get; set; }
    public DateTime? FirstVoiceAt { get; set; }
    public DateTime? FirstFeaturedAt { get; set; }
}

public interface IProfileRepository
{
    Task<Streak?> GetStreakAsync(Guid userId, CancellationToken ct = default);
    Task UpsertStreakAsync(Streak streak, CancellationToken ct = default);
    Task<IReadOnlyList<DateTime>> GetStoryDatesSinceAsync(Guid userId, DateTime sinceUtcDate, CancellationToken ct = default);
    Task<ProfileStatsRow> GetStatsAsync(Guid userId, CancellationToken ct = default);
    Task<MilestoneDataRow> GetMilestoneDataAsync(Guid userId, CancellationToken ct = default);
}
