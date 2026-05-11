using CoreBackend.API.Models.Responses;
using CoreBackend.API.Repositories.Interfaces;
using Dapper;

namespace CoreBackend.API.Repositories;

public class NavigationRepository : INavigationRepository
{
    private static readonly IReadOnlyDictionary<string, int> RoleRank = new Dictionary<string, int>
    {
        ["guest"] = 1,
        ["registered"] = 2,
        ["paid"] = 3,
    };

    private readonly IDbConnectionFactory _factory;

    public NavigationRepository(IDbConnectionFactory factory) => _factory = factory;

    public async Task<IReadOnlyList<NavigationItemResponse>> GetForProductAndRoleAsync(
        Guid productId, string userType, string languageCode, CancellationToken ct = default)
    {
        var userRank = RoleRank.TryGetValue(userType, out var r) ? r : 1;
        var role = userType;

        const string sql = @"
            SELECT
                ni.[Key],
                COALESCE(nt.Label, ni.[Key])      AS Label,
                ni.Route,
                ni.Icon,
                ni.[Order],
                ni.RequiredRole
            FROM dbo.NavigationItems ni
            OUTER APPLY (
                SELECT TOP 1 Label
                FROM dbo.NavigationTranslations
                WHERE NavigationItemId = ni.Id
                  AND IsDeleted = 0
                  AND (LanguageCode = @Lang OR LanguageCode = 'en')
                ORDER BY CASE WHEN LanguageCode = @Lang THEN 0 ELSE 1 END
            ) nt
            WHERE ni.ProductId = @ProductId
              AND ni.IsDeleted = 0
              AND ni.IsVisible = 1
            ORDER BY ni.[Order]";

        using var conn = _factory.CreateConnection();
        var rows = await conn.QueryAsync<(string Key, string Label, string Route, string? Icon, int Order, string RequiredRole)>(
            new CommandDefinition(sql, new { ProductId = productId, Lang = languageCode }, cancellationToken: ct));

        var list = new List<NavigationItemResponse>();
        foreach (var row in rows)
        {
            var required = RoleRank.TryGetValue(row.RequiredRole, out var rr) ? rr : 1;
            if (userRank >= required)
                list.Add(new NavigationItemResponse(row.Key, row.Label, row.Route, row.Icon, row.Order));
        }
        return list;
    }
}
