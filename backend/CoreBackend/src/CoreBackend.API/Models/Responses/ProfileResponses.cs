namespace CoreBackend.API.Models.Responses;

public record StreakResponse(int CurrentDays, int LongestDays, IReadOnlyList<bool> WeekProgress, DateTime? LastEntryAt);

public record ProfileStatsResponse(int TotalStories, int DaysActive, int WordsWritten, int FeaturedCount);

public record MilestoneResponse(string Key, string Label, DateTime? AchievedAt, string Icon, bool Highlight);
