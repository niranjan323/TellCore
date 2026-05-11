using System.Text.Json;
using CoreBackend.API.Models.Entities;
using CoreBackend.API.Models.Responses;
using CoreBackend.API.Repositories.Interfaces;
using Dapper;

namespace CoreBackend.API.Repositories;

public class SummaryRepository : ISummaryRepository
{
    private readonly IDbConnectionFactory _factory;

    public SummaryRepository(IDbConnectionFactory factory) => _factory = factory;

    public async Task InsertAsync(Summary summary, CancellationToken ct = default)
    {
        const string sql = @"
            INSERT INTO dbo.Summaries
                (Id, SessionId, LanguageCode, Title, Subtitle, Disclaimer,
                 SectionsJson, IsAiGenerated, AiProvider, AiModel, GeneratedAt, CreatedAt)
            VALUES
                (@Id, @SessionId, @LanguageCode, @Title, @Subtitle, @Disclaimer,
                 @SectionsJson, @IsAiGenerated, @AiProvider, @AiModel, @GeneratedAt, SYSUTCDATETIME())";
        if (summary.Id == Guid.Empty) summary.Id = Guid.NewGuid();
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, summary, cancellationToken: ct));
    }

    public async Task<SummaryResponse?> GetLatestForSessionAsync(Guid sessionId, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT TOP 1
                SessionId, Title, Subtitle, Disclaimer, SectionsJson, IsAiGenerated, GeneratedAt
            FROM dbo.Summaries
            WHERE SessionId = @SessionId AND IsDeleted = 0
            ORDER BY GeneratedAt DESC";
        using var conn = _factory.CreateConnection();
        var row = await conn.QuerySingleOrDefaultAsync<SummaryRow>(
            new CommandDefinition(sql, new { SessionId = sessionId }, cancellationToken: ct));
        if (row is null) return null;

        var sections = TryDeserializeSections(row.SectionsJson);
        return new SummaryResponse(
            row.SessionId, row.Title, row.Subtitle, row.Disclaimer,
            sections, row.IsAiGenerated, row.GeneratedAt);
    }

    private static IReadOnlyList<SummarySection> TryDeserializeSections(string json)
    {
        if (string.IsNullOrWhiteSpace(json)) return Array.Empty<SummarySection>();
        try
        {
            return JsonSerializer.Deserialize<List<SummarySection>>(json) ?? new List<SummarySection>();
        }
        catch
        {
            return Array.Empty<SummarySection>();
        }
    }

    private record SummaryRow(
        Guid SessionId,
        string Title,
        string? Subtitle,
        string? Disclaimer,
        string SectionsJson,
        bool IsAiGenerated,
        DateTime GeneratedAt);
}
