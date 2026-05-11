using CoreBackend.API.Models.Entities;
using CoreBackend.API.Repositories.Interfaces;
using Dapper;

namespace CoreBackend.API.Repositories;

public class AnswerRepository : IAnswerRepository
{
    private readonly IDbConnectionFactory _factory;

    public AnswerRepository(IDbConnectionFactory factory) => _factory = factory;

    public async Task UpsertBulkAsync(IEnumerable<Answer> answers, CancellationToken ct = default)
    {
        const string sql = @"
            MERGE dbo.Answers AS target
            USING (SELECT @SessionId AS SessionId, @QuestionId AS QuestionId) AS src
            ON target.SessionId = src.SessionId AND target.QuestionId = src.QuestionId AND target.IsDeleted = 0
            WHEN MATCHED THEN
                UPDATE SET ValueJson = @ValueJson, QuestionKey = @QuestionKey,
                           UpdatedAt = SYSUTCDATETIME()
            WHEN NOT MATCHED THEN
                INSERT (Id, SessionId, QuestionId, QuestionKey, ValueJson, CreatedAt)
                VALUES (@Id, @SessionId, @QuestionId, @QuestionKey, @ValueJson, SYSUTCDATETIME());";

        using var conn = _factory.CreateConnection();
        var prepared = answers.Select(a =>
        {
            if (a.Id == Guid.Empty) a.Id = Guid.NewGuid();
            return a;
        }).ToList();
        await conn.ExecuteAsync(new CommandDefinition(sql, prepared, cancellationToken: ct));
    }

    public async Task<IReadOnlyList<Answer>> GetForSessionAsync(Guid sessionId, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT Id, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy, IsDeleted,
                   SessionId, QuestionId, QuestionKey, ValueJson
            FROM dbo.Answers
            WHERE SessionId = @SessionId AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        var rows = await conn.QueryAsync<Answer>(
            new CommandDefinition(sql, new { SessionId = sessionId }, cancellationToken: ct));
        return rows.AsList();
    }
}
