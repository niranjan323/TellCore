using CoreBackend.API.Models.Responses;
using CoreBackend.API.Repositories.Interfaces;
using Dapper;

namespace CoreBackend.API.Repositories;

public class ThemeRepository : IThemeRepository
{
    private readonly IDbConnectionFactory _factory;

    public ThemeRepository(IDbConnectionFactory factory) => _factory = factory;

    public async Task<ThemeResponse?> GetActiveAsync(Guid productId, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT TOP 1 Id, Slug, Name
            FROM dbo.Themes
            WHERE ProductId = @ProductId AND IsDeleted = 0 AND IsActive = 1
            ORDER BY IsDefault DESC, CreatedAt ASC";

        using var conn = _factory.CreateConnection();
        var theme = await conn.QuerySingleOrDefaultAsync<(Guid Id, string Slug, string Name)?>(
            new CommandDefinition(sql, new { ProductId = productId }, cancellationToken: ct));
        if (theme is null) return null;

        var vars = await LoadVariablesAsync(conn, theme.Value.Id, ct);
        return new ThemeResponse(theme.Value.Slug, theme.Value.Name, vars);
    }

    public async Task<ThemeResponse?> GetBySlugAsync(Guid productId, string themeSlug, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT TOP 1 Id, Slug, Name
            FROM dbo.Themes
            WHERE ProductId = @ProductId AND Slug = @Slug AND IsDeleted = 0";

        using var conn = _factory.CreateConnection();
        var theme = await conn.QuerySingleOrDefaultAsync<(Guid Id, string Slug, string Name)?>(
            new CommandDefinition(sql, new { ProductId = productId, Slug = themeSlug }, cancellationToken: ct));
        if (theme is null) return null;

        var vars = await LoadVariablesAsync(conn, theme.Value.Id, ct);
        return new ThemeResponse(theme.Value.Slug, theme.Value.Name, vars);
    }

    private static async Task<IReadOnlyDictionary<string, string>> LoadVariablesAsync(
        System.Data.IDbConnection conn, Guid themeId, CancellationToken ct)
    {
        const string sql = @"
            SELECT [Key] AS [Key], [Value] AS [Value]
            FROM dbo.ThemeVariables
            WHERE ThemeId = @ThemeId AND IsDeleted = 0";
        var rows = await conn.QueryAsync<(string Key, string Value)>(
            new CommandDefinition(sql, new { ThemeId = themeId }, cancellationToken: ct));
        return rows.ToDictionary(r => r.Key, r => r.Value, StringComparer.Ordinal);
    }
}
