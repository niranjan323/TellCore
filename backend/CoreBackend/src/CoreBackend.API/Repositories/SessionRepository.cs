using CoreBackend.API.Models.Entities;
using CoreBackend.API.Models.Responses;
using CoreBackend.API.Repositories.Interfaces;
using Dapper;

namespace CoreBackend.API.Repositories;

public class SessionRepository : ISessionRepository
{
    private readonly IDbConnectionFactory _factory;

    public SessionRepository(IDbConnectionFactory factory) => _factory = factory;

    public async Task InsertAsync(Session session, CancellationToken ct = default)
    {
        const string sql = @"
            INSERT INTO dbo.Sessions
                (Id, UserId, ProductId, FormSetId, LanguageCode, Status,
                 VoiceNoteUrl, VoiceTranscript, CompletedAt, CreatedAt, CreatedBy)
            VALUES
                (@Id, @UserId, @ProductId, @FormSetId, @LanguageCode, @Status,
                 @VoiceNoteUrl, @VoiceTranscript, @CompletedAt, SYSUTCDATETIME(), @UserId)";
        if (session.Id == Guid.Empty) session.Id = Guid.NewGuid();
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, session, cancellationToken: ct));
    }

    public async Task<Session?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT TOP 1 Id, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy, IsDeleted,
                   UserId, ProductId, FormSetId, LanguageCode, Status,
                   VoiceNoteUrl, VoiceTranscript, CompletedAt
            FROM dbo.Sessions
            WHERE Id = @Id AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<Session>(
            new CommandDefinition(sql, new { Id = id }, cancellationToken: ct));
    }

    public async Task UpdateVoiceAsync(Guid sessionId, string voiceUrl, string? transcript, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE dbo.Sessions
            SET VoiceNoteUrl = @Url, VoiceTranscript = @Transcript,
                UpdatedAt = SYSUTCDATETIME(), UpdatedBy = (SELECT UserId FROM dbo.Sessions WHERE Id = @Id)
            WHERE Id = @Id AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, new { Id = sessionId, Url = voiceUrl, Transcript = transcript }, cancellationToken: ct));
    }

    public async Task MarkCompletedAsync(Guid sessionId, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE dbo.Sessions
            SET Status = 'completed', CompletedAt = SYSUTCDATETIME(),
                UpdatedAt = SYSUTCDATETIME()
            WHERE Id = @Id AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, new { Id = sessionId }, cancellationToken: ct));
    }

    public async Task SoftDeleteAllForUserAsync(Guid userId, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE dbo.Sessions SET IsDeleted = 1, UpdatedAt = SYSUTCDATETIME(), UpdatedBy = @UserId
            WHERE UserId = @UserId";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, new { UserId = userId }, cancellationToken: ct));
    }

    public async Task<IReadOnlyList<SessionHistoryItem>> GetHistoryForUserAsync(Guid userId, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT
                s.Id              AS SessionId,
                p.Slug            AS ProductSlug,
                f.Slug            AS FormSetSlug,
                s.LanguageCode    AS LanguageCode,
                s.Status          AS Status,
                sm.Title          AS Title,
                s.CreatedAt       AS CreatedAt,
                s.CompletedAt     AS CompletedAt
            FROM dbo.Sessions s
            INNER JOIN dbo.Products p ON p.Id = s.ProductId
            INNER JOIN dbo.FormSets f ON f.Id = s.FormSetId
            OUTER APPLY (
                SELECT TOP 1 Title
                FROM dbo.Summaries
                WHERE SessionId = s.Id AND IsDeleted = 0
                ORDER BY GeneratedAt DESC
            ) sm
            WHERE s.UserId = @UserId AND s.IsDeleted = 0
            ORDER BY s.CreatedAt DESC";

        using var conn = _factory.CreateConnection();
        var rows = await conn.QueryAsync<SessionHistoryItem>(
            new CommandDefinition(sql, new { UserId = userId }, cancellationToken: ct));
        return rows.AsList();
    }
}
