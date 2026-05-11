using CoreBackend.API.Models.Entities;
using CoreBackend.API.Repositories.Interfaces;
using Dapper;

namespace CoreBackend.API.Repositories;

public class SettingsRepository : ISettingsRepository
{
    private readonly IDbConnectionFactory _factory;

    public SettingsRepository(IDbConnectionFactory factory) => _factory = factory;

    public async Task<Setting?> GetByKeyAsync(string key, Guid? productId = null, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT TOP 1 Id, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy, IsDeleted,
                   ProductId, [Key], [Value], DataType, Description, IsSecret
            FROM dbo.Settings
            WHERE [Key] = @Key
              AND IsDeleted = 0
              AND ((ProductId = @ProductId) OR (ProductId IS NULL AND @ProductId IS NULL))";

        using var conn = _factory.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<Setting>(
            new CommandDefinition(sql, new { Key = key, ProductId = productId }, cancellationToken: ct));
    }

    public async Task<string?> GetValueAsync(string key, Guid? productId = null, CancellationToken ct = default)
    {
        var s = await GetByKeyAsync(key, productId, ct);
        return s?.Value;
    }

    public async Task<IReadOnlyList<Setting>> GetAllAsync(Guid? productId = null, bool includeSecrets = false, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT Id, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy, IsDeleted,
                   ProductId, [Key], [Value], DataType, Description, IsSecret
            FROM dbo.Settings
            WHERE IsDeleted = 0
              AND ((ProductId = @ProductId) OR (@ProductId IS NULL))
              AND (@IncludeSecrets = 1 OR IsSecret = 0)
            ORDER BY [Key]";

        using var conn = _factory.CreateConnection();
        var rows = await conn.QueryAsync<Setting>(
            new CommandDefinition(sql, new { ProductId = productId, IncludeSecrets = includeSecrets ? 1 : 0 }, cancellationToken: ct));
        return rows.AsList();
    }

    public async Task UpsertAsync(Setting setting, CancellationToken ct = default)
    {
        const string sql = @"
            MERGE dbo.Settings AS target
            USING (SELECT @Key AS [Key], @ProductId AS ProductId) AS src
            ON target.[Key] = src.[Key]
               AND ((target.ProductId = src.ProductId) OR (target.ProductId IS NULL AND src.ProductId IS NULL))
               AND target.IsDeleted = 0
            WHEN MATCHED THEN
                UPDATE SET [Value] = @Value, DataType = @DataType, Description = @Description,
                           IsSecret = @IsSecret, UpdatedAt = SYSUTCDATETIME(), UpdatedBy = @UpdatedBy
            WHEN NOT MATCHED THEN
                INSERT (ProductId, [Key], [Value], DataType, Description, IsSecret)
                VALUES (@ProductId, @Key, @Value, @DataType, @Description, @IsSecret);";

        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, setting, cancellationToken: ct));
    }
}
