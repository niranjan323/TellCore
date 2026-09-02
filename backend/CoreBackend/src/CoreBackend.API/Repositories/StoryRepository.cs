using System.Text.Json;
using CoreBackend.API.Models.Entities;
using CoreBackend.API.Models.Responses;
using CoreBackend.API.Repositories.Interfaces;
using Dapper;

namespace CoreBackend.API.Repositories;

public class StoryRepository : IStoryRepository
{
    private readonly IDbConnectionFactory _factory;

    public StoryRepository(IDbConnectionFactory factory) => _factory = factory;

    private const string StoryColumns = @"
        s.Id, s.CreatedAt, s.UpdatedAt, s.CreatedBy, s.UpdatedBy, s.IsDeleted,
        s.UserId, s.ProductId, s.Title, s.Kind, s.OriginalLanguage, s.RawText, s.ContentText,
        s.Excerpt, s.Summary, s.AudioUrl, s.AudioPath, s.DurationSeconds, s.WordCount, s.Visibility,
        s.Status, s.ModerationReason, s.PromptKey, s.IsFeatured, s.HeartCount, s.ViewCount, s.PublishedAt,
        u.Name AS AuthorName, u.IsProfilePublic AS AuthorIsPublic";

    private const string StoryFrom = @"
        FROM dbo.Stories s
        INNER JOIN dbo.Users u ON u.Id = s.UserId";

    public async Task InsertAsync(Story story, CancellationToken ct = default)
    {
        const string sql = @"
            INSERT INTO dbo.Stories
                (Id, UserId, ProductId, Title, Kind, OriginalLanguage, RawText, ContentText,
                 Excerpt, AudioUrl, AudioPath, DurationSeconds, WordCount, Visibility, Status,
                 ModerationReason, PromptKey, PublishedAt, CreatedAt, CreatedBy)
            VALUES
                (@Id, @UserId, @ProductId, @Title, @Kind, @OriginalLanguage, @RawText, @ContentText,
                 @Excerpt, @AudioUrl, @AudioPath, @DurationSeconds, @WordCount, @Visibility, @Status,
                 @ModerationReason, @PromptKey, @PublishedAt, SYSUTCDATETIME(), @UserId)";
        if (story.Id == Guid.Empty) story.Id = Guid.NewGuid();
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, story, cancellationToken: ct));
    }

    public async Task<StoryRow?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var sql = $"SELECT TOP 1 {StoryColumns} {StoryFrom} WHERE s.Id = @Id AND s.IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<StoryRow>(
            new CommandDefinition(sql, new { Id = id }, cancellationToken: ct));
    }

    public async Task UpdateContentAsync(Story story, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE dbo.Stories
            SET Title = @Title, RawText = @RawText, ContentText = @ContentText, Excerpt = @Excerpt,
                WordCount = @WordCount, Visibility = @Visibility, Status = @Status,
                ModerationReason = @ModerationReason, PublishedAt = @PublishedAt,
                UpdatedAt = SYSUTCDATETIME(), UpdatedBy = @UserId
            WHERE Id = @Id AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, story, cancellationToken: ct));
    }

    public async Task UpdateStatusAsync(Guid storyId, string status, string? moderationReason, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE dbo.Stories
            SET Status = @Status, ModerationReason = @ModerationReason, UpdatedAt = SYSUTCDATETIME()
            WHERE Id = @Id AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql,
            new { Id = storyId, Status = status, ModerationReason = moderationReason }, cancellationToken: ct));
    }

    public async Task UpdateProcessingResultAsync(Story story, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE dbo.Stories
            SET Title = @Title, OriginalLanguage = @OriginalLanguage, RawText = @RawText,
                ContentText = @ContentText, Excerpt = @Excerpt, Summary = @Summary, WordCount = @WordCount,
                Visibility = @Visibility, Status = @Status, ModerationReason = @ModerationReason,
                PublishedAt = @PublishedAt, UpdatedAt = SYSUTCDATETIME()
            WHERE Id = @Id AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, story, cancellationToken: ct));
    }

    public async Task UpdateAudioAsync(Guid storyId, string audioUrl, string audioPath, int? durationSeconds, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE dbo.Stories
            SET AudioUrl = @AudioUrl, AudioPath = @AudioPath, DurationSeconds = @DurationSeconds,
                Kind = 'voice', UpdatedAt = SYSUTCDATETIME()
            WHERE Id = @Id AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql,
            new { Id = storyId, AudioUrl = audioUrl, AudioPath = audioPath, DurationSeconds = durationSeconds }, cancellationToken: ct));
    }

    public async Task SoftDeleteAsync(Guid storyId, Guid userId, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE dbo.Stories SET IsDeleted = 1, UpdatedAt = SYSUTCDATETIME(), UpdatedBy = @UserId
            WHERE Id = @Id AND UserId = @UserId";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, new { Id = storyId, UserId = userId }, cancellationToken: ct));
    }

    public async Task<int> CountForUserAsync(Guid userId, CancellationToken ct = default)
    {
        const string sql = "SELECT COUNT(*) FROM dbo.Stories WHERE UserId = @UserId AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        return await conn.ExecuteScalarAsync<int>(new CommandDefinition(sql, new { UserId = userId }, cancellationToken: ct));
    }

    public async Task<int> CountForUserSinceAsync(Guid userId, DateTime sinceUtc, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT COUNT(*) FROM dbo.Stories
            WHERE UserId = @UserId AND IsDeleted = 0 AND CreatedAt >= @Since";
        using var conn = _factory.CreateConnection();
        return await conn.ExecuteScalarAsync<int>(new CommandDefinition(sql,
            new { UserId = userId, Since = sinceUtc }, cancellationToken: ct));
    }

    public async Task<IReadOnlyList<StoryRow>> GetMineAsync(Guid userId, CancellationToken ct = default)
    {
        var sql = $@"
            SELECT {StoryColumns} {StoryFrom}
            WHERE s.UserId = @UserId AND s.IsDeleted = 0
            ORDER BY s.CreatedAt DESC";
        using var conn = _factory.CreateConnection();
        var rows = await conn.QueryAsync<StoryRow>(new CommandDefinition(sql, new { UserId = userId }, cancellationToken: ct));
        return rows.AsList();
    }

    public async Task<IReadOnlyList<StoryRow>> GetCommunityFeedAsync(Guid productId, int page, int pageSize, CancellationToken ct = default)
    {
        var sql = $@"
            SELECT {StoryColumns} {StoryFrom}
            WHERE s.ProductId = @ProductId AND s.Visibility = 'community'
              AND s.Status = 'published' AND s.IsDeleted = 0
            ORDER BY s.PublishedAt DESC
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";
        using var conn = _factory.CreateConnection();
        var rows = await conn.QueryAsync<StoryRow>(new CommandDefinition(sql,
            new { ProductId = productId, Offset = (page - 1) * pageSize, PageSize = pageSize }, cancellationToken: ct));
        return rows.AsList();
    }

    public async Task<IReadOnlyList<StoryRow>> GetFamilyStoriesAsync(IReadOnlyList<Guid> ownerUserIds, CancellationToken ct = default)
    {
        if (ownerUserIds.Count == 0) return Array.Empty<StoryRow>();
        var sql = $@"
            SELECT {StoryColumns} {StoryFrom}
            WHERE s.UserId IN @OwnerIds AND s.Visibility IN ('family','community')
              AND s.Status = 'published' AND s.IsDeleted = 0
            ORDER BY s.PublishedAt DESC";
        using var conn = _factory.CreateConnection();
        var rows = await conn.QueryAsync<StoryRow>(new CommandDefinition(sql, new { OwnerIds = ownerUserIds }, cancellationToken: ct));
        return rows.AsList();
    }

    public async Task<IReadOnlyDictionary<Guid, List<string>>> GetTagsAsync(IEnumerable<Guid> storyIds, CancellationToken ct = default)
    {
        var ids = storyIds.Distinct().ToList();
        if (ids.Count == 0) return new Dictionary<Guid, List<string>>();
        const string sql = @"
            SELECT StoryId, Tag FROM dbo.StoryTags
            WHERE StoryId IN @Ids AND IsDeleted = 0
            ORDER BY CreatedAt";
        using var conn = _factory.CreateConnection();
        var rows = await conn.QueryAsync<(Guid StoryId, string Tag)>(
            new CommandDefinition(sql, new { Ids = ids }, cancellationToken: ct));
        return rows.GroupBy(r => r.StoryId).ToDictionary(g => g.Key, g => g.Select(r => r.Tag).ToList());
    }

    public async Task ReplaceTagsAsync(Guid storyId, IEnumerable<string> tags, Guid userId, CancellationToken ct = default)
    {
        const string clearSql = @"
            UPDATE dbo.StoryTags SET IsDeleted = 1, UpdatedAt = SYSUTCDATETIME(), UpdatedBy = @UserId
            WHERE StoryId = @StoryId AND IsDeleted = 0";
        const string insertSql = @"
            INSERT INTO dbo.StoryTags (StoryId, Tag, CreatedBy) VALUES (@StoryId, @Tag, @UserId)";

        var clean = tags
            .Select(t => t.Trim().ToLowerInvariant())
            .Where(t => t.Length is > 0 and <= 50)
            .Distinct()
            .Take(10)
            .ToList();

        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(clearSql, new { StoryId = storyId, UserId = userId }, cancellationToken: ct));
        foreach (var tag in clean)
            await conn.ExecuteAsync(new CommandDefinition(insertSql, new { StoryId = storyId, Tag = tag, UserId = userId }, cancellationToken: ct));
    }

    public async Task UpsertTranslationAsync(StoryTranslation translation, CancellationToken ct = default)
    {
        const string sql = @"
            MERGE dbo.StoryTranslations AS target
            USING (SELECT @StoryId AS StoryId, @LanguageCode AS LanguageCode) AS src
            ON target.StoryId = src.StoryId AND target.LanguageCode = src.LanguageCode AND target.IsDeleted = 0
            WHEN MATCHED THEN
                UPDATE SET Title = @Title, ContentText = @ContentText, Excerpt = @Excerpt,
                           IsAiGenerated = @IsAiGenerated, UpdatedAt = SYSUTCDATETIME()
            WHEN NOT MATCHED THEN
                INSERT (StoryId, LanguageCode, Title, ContentText, Excerpt, IsAiGenerated)
                VALUES (@StoryId, @LanguageCode, @Title, @ContentText, @Excerpt, @IsAiGenerated);";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, translation, cancellationToken: ct));
    }

    public async Task ReplaceEmbeddingsAsync(Guid storyId, IReadOnlyList<AiEmbeddingChunk> chunks, CancellationToken ct = default)
    {
        const string clearSql = @"
            UPDATE dbo.StoryEmbeddings SET IsDeleted = 1, UpdatedAt = SYSUTCDATETIME()
            WHERE StoryId = @StoryId AND IsDeleted = 0";
        const string insertSql = @"
            INSERT INTO dbo.StoryEmbeddings (StoryId, ChunkIndex, ChunkText, Embedding)
            VALUES (@StoryId, @ChunkIndex, @ChunkText, CAST(@Embedding AS VECTOR(384)))";

        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(clearSql, new { StoryId = storyId }, cancellationToken: ct));
        foreach (var chunk in chunks)
        {
            await conn.ExecuteAsync(new CommandDefinition(insertSql, new
            {
                StoryId = storyId,
                ChunkIndex = chunk.Index,
                ChunkText = chunk.Text.Length > 1000 ? chunk.Text[..1000] : chunk.Text,
                Embedding = JsonSerializer.Serialize(chunk.Embedding),
            }, cancellationToken: ct));
        }
    }

    public async Task<IReadOnlyList<Guid>> SearchByVectorAsync(float[] queryEmbedding, Guid productId, Guid viewerUserId, int top, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT TOP (@Top) s.Id
            FROM dbo.Stories s
            INNER JOIN (
                SELECT StoryId, MIN(VECTOR_DISTANCE('cosine', Embedding, CAST(@Q AS VECTOR(384)))) AS Dist
                FROM dbo.StoryEmbeddings
                WHERE IsDeleted = 0
                GROUP BY StoryId
            ) e ON e.StoryId = s.Id
            WHERE s.IsDeleted = 0 AND s.ProductId = @ProductId
              AND ((s.Visibility = 'community' AND s.Status = 'published') OR s.UserId = @ViewerId)
            ORDER BY e.Dist ASC";
        using var conn = _factory.CreateConnection();
        var rows = await conn.QueryAsync<Guid>(new CommandDefinition(sql, new
        {
            Top = top,
            Q = JsonSerializer.Serialize(queryEmbedding),
            ProductId = productId,
            ViewerId = viewerUserId,
        }, cancellationToken: ct));
        return rows.AsList();
    }

    public async Task<IReadOnlyList<Guid>> SearchByTextAsync(string query, Guid productId, Guid viewerUserId, int top, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT TOP (@Top) s.Id
            FROM dbo.Stories s
            WHERE s.IsDeleted = 0 AND s.ProductId = @ProductId
              AND ((s.Visibility = 'community' AND s.Status = 'published') OR s.UserId = @ViewerId)
              AND (s.Title LIKE @Pattern OR s.ContentText LIKE @Pattern)
            ORDER BY s.PublishedAt DESC, s.CreatedAt DESC";
        using var conn = _factory.CreateConnection();
        var rows = await conn.QueryAsync<Guid>(new CommandDefinition(sql, new
        {
            Top = top,
            ProductId = productId,
            ViewerId = viewerUserId,
            Pattern = $"%{query.Replace("[", "[[]").Replace("%", "[%]").Replace("_", "[_]")}%",
        }, cancellationToken: ct));
        return rows.AsList();
    }

    public async Task<IReadOnlyList<StoryRow>> GetByIdsAsync(IReadOnlyList<Guid> ids, CancellationToken ct = default)
    {
        if (ids.Count == 0) return Array.Empty<StoryRow>();
        var sql = $"SELECT {StoryColumns} {StoryFrom} WHERE s.Id IN @Ids AND s.IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        var rows = await conn.QueryAsync<StoryRow>(new CommandDefinition(sql, new { Ids = ids }, cancellationToken: ct));
        // Preserve the caller's ranking order.
        var byId = rows.ToDictionary(r => r.Id);
        return ids.Where(byId.ContainsKey).Select(id => byId[id]).ToList();
    }

    public async Task RecordViewAsync(Guid storyId, Guid? viewerUserId, CancellationToken ct = default)
    {
        // One counted view per signed-in viewer per UTC day; anonymous views always count.
        const string sql = @"
            IF @ViewerUserId IS NULL OR NOT EXISTS (
                SELECT 1 FROM dbo.StoryViews
                WHERE StoryId = @StoryId AND ViewerUserId = @ViewerUserId
                  AND CreatedAt >= CAST(CAST(SYSUTCDATETIME() AS DATE) AS DATETIME2))
            BEGIN
                INSERT INTO dbo.StoryViews (StoryId, ViewerUserId, CreatedBy)
                VALUES (@StoryId, @ViewerUserId, @ViewerUserId);
                UPDATE dbo.Stories SET ViewCount = ViewCount + 1 WHERE Id = @StoryId AND IsDeleted = 0;
            END";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql,
            new { StoryId = storyId, ViewerUserId = viewerUserId }, cancellationToken: ct));
    }

    public async Task<bool> ToggleHeartAsync(Guid storyId, Guid userId, CancellationToken ct = default)
    {
        const string sql = @"
            DECLARE @existing UNIQUEIDENTIFIER = (
                SELECT TOP 1 Id FROM dbo.StoryHearts
                WHERE StoryId = @StoryId AND UserId = @UserId AND IsDeleted = 0);
            IF @existing IS NULL
            BEGIN
                INSERT INTO dbo.StoryHearts (StoryId, UserId, CreatedBy) VALUES (@StoryId, @UserId, @UserId);
                UPDATE dbo.Stories SET HeartCount = HeartCount + 1 WHERE Id = @StoryId AND IsDeleted = 0;
                SELECT CAST(1 AS BIT);
            END
            ELSE
            BEGIN
                UPDATE dbo.StoryHearts SET IsDeleted = 1, UpdatedAt = SYSUTCDATETIME(), UpdatedBy = @UserId
                WHERE Id = @existing;
                UPDATE dbo.Stories SET HeartCount = CASE WHEN HeartCount > 0 THEN HeartCount - 1 ELSE 0 END
                WHERE Id = @StoryId AND IsDeleted = 0;
                SELECT CAST(0 AS BIT);
            END";
        using var conn = _factory.CreateConnection();
        return await conn.ExecuteScalarAsync<bool>(new CommandDefinition(sql,
            new { StoryId = storyId, UserId = userId }, cancellationToken: ct));
    }

    public async Task<IReadOnlySet<Guid>> GetHeartedStoryIdsAsync(IEnumerable<Guid> storyIds, Guid userId, CancellationToken ct = default)
    {
        var ids = storyIds.Distinct().ToList();
        if (ids.Count == 0) return new HashSet<Guid>();
        const string sql = @"
            SELECT StoryId FROM dbo.StoryHearts
            WHERE StoryId IN @Ids AND UserId = @UserId AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        var rows = await conn.QueryAsync<Guid>(new CommandDefinition(sql, new { Ids = ids, UserId = userId }, cancellationToken: ct));
        return rows.ToHashSet();
    }

    public async Task<StoryRow?> GetFeaturedForDateAsync(Guid productId, DateTime dateUtc, CancellationToken ct = default)
    {
        var sql = $@"
            SELECT TOP 1 {StoryColumns}
            FROM dbo.FeaturedStories f
            INNER JOIN dbo.Stories s ON s.Id = f.StoryId AND s.IsDeleted = 0
            INNER JOIN dbo.Users u ON u.Id = s.UserId
            WHERE f.ProductId = @ProductId AND f.FeaturedOn = @Date AND f.IsDeleted = 0
            ORDER BY f.IsManualPick DESC, f.CreatedAt DESC";
        using var conn = _factory.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<StoryRow>(new CommandDefinition(sql,
            new { ProductId = productId, Date = dateUtc.Date }, cancellationToken: ct));
    }

    public async Task<StoryRow?> PickCommunityStoryForFeatureAsync(Guid productId, CancellationToken ct = default)
    {
        // Most-viewed community story not featured in the last 7 days; falls back to most recent.
        var sql = $@"
            SELECT TOP 1 {StoryColumns} {StoryFrom}
            WHERE s.ProductId = @ProductId AND s.Visibility = 'community'
              AND s.Status = 'published' AND s.IsDeleted = 0
              AND NOT EXISTS (
                  SELECT 1 FROM dbo.FeaturedStories f
                  WHERE f.StoryId = s.Id AND f.IsDeleted = 0
                    AND f.FeaturedOn >= DATEADD(DAY, -7, CAST(SYSUTCDATETIME() AS DATE)))
            ORDER BY s.ViewCount DESC, s.PublishedAt DESC";
        using var conn = _factory.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<StoryRow>(new CommandDefinition(sql,
            new { ProductId = productId }, cancellationToken: ct));
    }

    public async Task InsertFeaturedAsync(Guid productId, Guid storyId, DateTime dateUtc, bool isManualPick, CancellationToken ct = default)
    {
        const string sql = @"
            IF NOT EXISTS (SELECT 1 FROM dbo.FeaturedStories
                           WHERE ProductId = @ProductId AND FeaturedOn = @Date AND IsDeleted = 0)
                INSERT INTO dbo.FeaturedStories (ProductId, StoryId, FeaturedOn, IsManualPick)
                VALUES (@ProductId, @StoryId, @Date, @IsManualPick)";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql,
            new { ProductId = productId, StoryId = storyId, Date = dateUtc.Date, IsManualPick = isManualPick }, cancellationToken: ct));
    }

    public async Task SetIsFeaturedAsync(Guid storyId, bool isFeatured, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE dbo.Stories SET IsFeatured = @IsFeatured, UpdatedAt = SYSUTCDATETIME()
            WHERE Id = @Id AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, new { Id = storyId, IsFeatured = isFeatured }, cancellationToken: ct));
    }
}
