using CoreBackend.API.Models.Entities;
using CoreBackend.API.Repositories.Interfaces;
using Dapper;

namespace CoreBackend.API.Repositories;

public class ProfileRepository : IProfileRepository
{
    private readonly IDbConnectionFactory _factory;

    public ProfileRepository(IDbConnectionFactory factory) => _factory = factory;

    public async Task<Streak?> GetStreakAsync(Guid userId, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT TOP 1 Id, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy, IsDeleted,
                   UserId, CurrentStreak, LongestStreak, LastEntryDate
            FROM dbo.Streaks
            WHERE UserId = @UserId AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<Streak>(
            new CommandDefinition(sql, new { UserId = userId }, cancellationToken: ct));
    }

    public async Task UpsertStreakAsync(Streak streak, CancellationToken ct = default)
    {
        const string sql = @"
            MERGE dbo.Streaks AS target
            USING (SELECT @UserId AS UserId) AS src
            ON target.UserId = src.UserId AND target.IsDeleted = 0
            WHEN MATCHED THEN
                UPDATE SET CurrentStreak = @CurrentStreak, LongestStreak = @LongestStreak,
                           LastEntryDate = @LastEntryDate, UpdatedAt = SYSUTCDATETIME(), UpdatedBy = @UserId
            WHEN NOT MATCHED THEN
                INSERT (UserId, CurrentStreak, LongestStreak, LastEntryDate, CreatedBy)
                VALUES (@UserId, @CurrentStreak, @LongestStreak, @LastEntryDate, @UserId);";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, streak, cancellationToken: ct));
    }

    public async Task<IReadOnlyList<DateTime>> GetStoryDatesSinceAsync(Guid userId, DateTime sinceUtcDate, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT DISTINCT CAST(CreatedAt AS DATE)
            FROM dbo.Stories
            WHERE UserId = @UserId AND IsDeleted = 0 AND CreatedAt >= @Since";
        using var conn = _factory.CreateConnection();
        var rows = await conn.QueryAsync<DateTime>(
            new CommandDefinition(sql, new { UserId = userId, Since = sinceUtcDate.Date }, cancellationToken: ct));
        return rows.AsList();
    }

    public async Task<ProfileStatsRow> GetStatsAsync(Guid userId, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT
                COUNT(*)                                            AS TotalStories,
                COUNT(DISTINCT CAST(CreatedAt AS DATE))             AS DaysActive,
                ISNULL(SUM(WordCount), 0)                           AS WordsWritten,
                ISNULL(SUM(CASE WHEN IsFeatured = 1 THEN 1 ELSE 0 END), 0) AS FeaturedCount
            FROM dbo.Stories
            WHERE UserId = @UserId AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        return await conn.QuerySingleAsync<ProfileStatsRow>(
            new CommandDefinition(sql, new { UserId = userId }, cancellationToken: ct));
    }

    public async Task<MilestoneDataRow> GetMilestoneDataAsync(Guid userId, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT
                MIN(CreatedAt)                                          AS FirstStoryAt,
                MIN(CASE WHEN Kind = 'voice' THEN CreatedAt END)        AS FirstVoiceAt,
                MIN(CASE WHEN IsFeatured = 1 THEN PublishedAt END)      AS FirstFeaturedAt
            FROM dbo.Stories
            WHERE UserId = @UserId AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        return await conn.QuerySingleAsync<MilestoneDataRow>(
            new CommandDefinition(sql, new { UserId = userId }, cancellationToken: ct));
    }
}
