using System.Text.Json;
using CoreBackend.API.Models.Entities;
using CoreBackend.API.Models.Responses;
using CoreBackend.API.Repositories.Interfaces;
using Dapper;

namespace CoreBackend.API.Repositories;

public class FormSetRepository : IFormSetRepository
{
    private readonly IDbConnectionFactory _factory;

    public FormSetRepository(IDbConnectionFactory factory) => _factory = factory;

    private const string FormSetColumns = @"
        Id, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy, IsDeleted,
        ProductId, Slug, Name, Description, IsDefault, IsActive";

    public async Task<FormSet?> GetDefaultAsync(Guid productId, CancellationToken ct = default)
    {
        var sql = $@"
            SELECT TOP 1 {FormSetColumns} FROM dbo.FormSets
            WHERE ProductId = @ProductId AND IsDeleted = 0 AND IsActive = 1
            ORDER BY IsDefault DESC, CreatedAt ASC";
        using var conn = _factory.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<FormSet>(
            new CommandDefinition(sql, new { ProductId = productId }, cancellationToken: ct));
    }

    public async Task<FormSet?> GetBySlugAsync(Guid productId, string slug, CancellationToken ct = default)
    {
        var sql = $@"
            SELECT TOP 1 {FormSetColumns} FROM dbo.FormSets
            WHERE ProductId = @ProductId AND Slug = @Slug AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<FormSet>(
            new CommandDefinition(sql, new { ProductId = productId, Slug = slug }, cancellationToken: ct));
    }

    public async Task<FormSet?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var sql = $@"
            SELECT TOP 1 {FormSetColumns} FROM dbo.FormSets WHERE Id = @Id AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<FormSet>(
            new CommandDefinition(sql, new { Id = id }, cancellationToken: ct));
    }

    public async Task<IReadOnlyList<Question>> GetQuestionsAsync(Guid formSetId, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT Id, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy, IsDeleted,
                   FormSetId, [Key], [Type], [Order], IsRequired, [Group], ConfigJson
            FROM dbo.Questions
            WHERE FormSetId = @FormSetId AND IsDeleted = 0
            ORDER BY [Order]";
        using var conn = _factory.CreateConnection();
        var rows = await conn.QueryAsync<Question>(
            new CommandDefinition(sql, new { FormSetId = formSetId }, cancellationToken: ct));
        return rows.AsList();
    }

    public async Task<IReadOnlyList<SummaryTemplate>> GetSummaryTemplatesAsync(Guid formSetId, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT Id, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy, IsDeleted,
                   FormSetId, SectionKey, SectionTitle, [Order], QuestionKeysJson, PromptHint
            FROM dbo.SummaryTemplates
            WHERE FormSetId = @FormSetId AND IsDeleted = 0
            ORDER BY [Order]";
        using var conn = _factory.CreateConnection();
        var rows = await conn.QueryAsync<SummaryTemplate>(
            new CommandDefinition(sql, new { FormSetId = formSetId }, cancellationToken: ct));
        return rows.AsList();
    }

    public async Task<FormSetResponse?> LoadFullAsync(Guid formSetId, string languageCode, CancellationToken ct = default)
    {
        using var conn = _factory.CreateConnection();

        var fs = await conn.QuerySingleOrDefaultAsync<FormSet>(new CommandDefinition(
            $"SELECT TOP 1 {FormSetColumns} FROM dbo.FormSets WHERE Id = @Id AND IsDeleted = 0",
            new { Id = formSetId }, cancellationToken: ct));
        if (fs is null) return null;

        IntroResponse? intro = await LoadIntroAsync(conn, formSetId, languageCode, ct);

        const string qSql = @"
            SELECT
                q.Id            AS Id,
                q.[Key]         AS [Key],
                q.[Type]        AS [Type],
                q.[Order]       AS [Order],
                q.IsRequired    AS IsRequired,
                q.[Group]       AS [Group],
                q.ConfigJson    AS ConfigJson,
                COALESCE(qt.Label, q.[Key])    AS Label,
                qt.Placeholder                 AS Placeholder,
                qt.HelpText                    AS HelpText
            FROM dbo.Questions q
            OUTER APPLY (
                SELECT TOP 1 Label, Placeholder, HelpText
                FROM dbo.QuestionTranslations
                WHERE QuestionId = q.Id AND IsDeleted = 0
                  AND (LanguageCode = @Lang OR LanguageCode = 'en')
                ORDER BY CASE WHEN LanguageCode = @Lang THEN 0 ELSE 1 END
            ) qt
            WHERE q.FormSetId = @FormSetId AND q.IsDeleted = 0
            ORDER BY q.[Order]";

        var qRows = (await conn.QueryAsync<QuestionRow>(
            new CommandDefinition(qSql, new { FormSetId = formSetId, Lang = languageCode }, cancellationToken: ct)))
            .AsList();

        if (qRows.Count == 0)
            return new FormSetResponse(fs.Id, fs.Slug, fs.Name, languageCode, intro, Array.Empty<QuestionResponse>());

        var questionIds = qRows.Select(r => r.Id).ToArray();

        const string oSql = @"
            SELECT
                o.QuestionId,
                o.[Value]               AS [Value],
                COALESCE(ot.Label, o.[Value]) AS Label,
                o.[Order]               AS [Order]
            FROM dbo.QuestionOptions o
            OUTER APPLY (
                SELECT TOP 1 Label
                FROM dbo.QuestionOptionTranslations
                WHERE QuestionOptionId = o.Id AND IsDeleted = 0
                  AND (LanguageCode = @Lang OR LanguageCode = 'en')
                ORDER BY CASE WHEN LanguageCode = @Lang THEN 0 ELSE 1 END
            ) ot
            WHERE o.QuestionId IN @QuestionIds AND o.IsDeleted = 0
            ORDER BY o.[Order]";

        var optRows = (await conn.QueryAsync<OptionRow>(
            new CommandDefinition(oSql, new { QuestionIds = questionIds, Lang = languageCode }, cancellationToken: ct)))
            .AsList();

        const string cSql = @"
            SELECT QuestionId, DependsOnKey, [Operator], ValuesJson
            FROM dbo.QuestionConditions
            WHERE QuestionId IN @QuestionIds AND IsDeleted = 0";

        var condRows = (await conn.QueryAsync<ConditionRow>(
            new CommandDefinition(cSql, new { QuestionIds = questionIds }, cancellationToken: ct)))
            .AsList();

        var optionsByQ = optRows.GroupBy(o => o.QuestionId)
            .ToDictionary(g => g.Key, g => (IReadOnlyList<QuestionOptionResponse>)g
                .Select(x => new QuestionOptionResponse(x.Value, x.Label, x.Order))
                .ToList());

        var condsByQ = condRows.GroupBy(c => c.QuestionId)
            .ToDictionary(g => g.Key, g => (IReadOnlyList<QuestionConditionResponse>)g
                .Select(x => new QuestionConditionResponse(x.DependsOnKey, x.Operator, x.ValuesJson))
                .ToList());

        var questions = qRows.Select(r =>
        {
            object? config = null;
            if (!string.IsNullOrWhiteSpace(r.ConfigJson))
            {
                try { config = JsonSerializer.Deserialize<JsonElement>(r.ConfigJson); }
                catch { config = null; }
            }
            var opts = optionsByQ.TryGetValue(r.Id, out var o) ? o : Array.Empty<QuestionOptionResponse>();
            var conds = condsByQ.TryGetValue(r.Id, out var c) ? c : Array.Empty<QuestionConditionResponse>();
            return new QuestionResponse(r.Id, r.Key, r.Type, r.Order, r.IsRequired, r.Group,
                r.Label, r.Placeholder, r.HelpText, config, opts, conds);
        }).ToList();

        return new FormSetResponse(fs.Id, fs.Slug, fs.Name, languageCode, intro, questions);
    }

    private static async Task<IntroResponse?> LoadIntroAsync(
        System.Data.IDbConnection conn, Guid formSetId, string languageCode, CancellationToken ct)
    {
        const string sql = @"
            SELECT TOP 1
                i.Id                  AS Id,
                i.IconKey             AS IconKey,
                i.PrimaryButtonRoute  AS PrimaryButtonRoute,
                i.VoiceNoteEnabled    AS VoiceNoteEnabled,
                COALESCE(it.Title, '')         AS Title,
                it.Subtitle                    AS Subtitle,
                it.Body                        AS Body,
                it.AudioUrl                    AS AudioUrl,
                it.PrimaryButtonLabel          AS PrimaryButtonLabel
            FROM dbo.Intros i
            OUTER APPLY (
                SELECT TOP 1 Title, Subtitle, Body, AudioUrl, PrimaryButtonLabel
                FROM dbo.IntroTranslations
                WHERE IntroId = i.Id AND IsDeleted = 0
                  AND (LanguageCode = @Lang OR LanguageCode = 'en')
                ORDER BY CASE WHEN LanguageCode = @Lang THEN 0 ELSE 1 END
            ) it
            WHERE i.FormSetId = @FormSetId AND i.IsDeleted = 0";

        return await conn.QuerySingleOrDefaultAsync<IntroResponse>(
            new CommandDefinition(sql, new { FormSetId = formSetId, Lang = languageCode }, cancellationToken: ct));
    }

    private record QuestionRow(
        Guid Id, string Key, string Type, int Order, bool IsRequired,
        string? Group, string? ConfigJson,
        string Label, string? Placeholder, string? HelpText);

    private record OptionRow(Guid QuestionId, string Value, string Label, int Order);

    private record ConditionRow(Guid QuestionId, string DependsOnKey, string Operator, string ValuesJson);
}
