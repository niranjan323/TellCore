using CoreBackend.API.Models.Entities;
using CoreBackend.API.Repositories.Interfaces;
using Dapper;

namespace CoreBackend.API.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly IDbConnectionFactory _factory;

    public ProductRepository(IDbConnectionFactory factory) => _factory = factory;

    private const string SelectColumns = @"
        Id, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy, IsDeleted,
        Slug, Name, Description, IsActive, DefaultThemeId, DefaultFormSetId, DefaultLanguage";

    public async Task<Product?> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        var sql = $"SELECT TOP 1 {SelectColumns} FROM dbo.Products WHERE Slug = @Slug AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<Product>(
            new CommandDefinition(sql, new { Slug = slug }, cancellationToken: ct));
    }

    public async Task<Product?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var sql = $"SELECT TOP 1 {SelectColumns} FROM dbo.Products WHERE Id = @Id AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<Product>(
            new CommandDefinition(sql, new { Id = id }, cancellationToken: ct));
    }
}
