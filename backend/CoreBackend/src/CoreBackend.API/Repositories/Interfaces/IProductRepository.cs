using CoreBackend.API.Models.Entities;

namespace CoreBackend.API.Repositories.Interfaces;

public interface IProductRepository
{
    Task<Product?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<Product?> GetByIdAsync(Guid id, CancellationToken ct = default);
}
