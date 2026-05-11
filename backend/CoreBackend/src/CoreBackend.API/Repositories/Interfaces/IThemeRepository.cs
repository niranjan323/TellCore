using CoreBackend.API.Models.Responses;

namespace CoreBackend.API.Repositories.Interfaces;

public interface IThemeRepository
{
    Task<ThemeResponse?> GetActiveAsync(Guid productId, CancellationToken ct = default);
    Task<ThemeResponse?> GetBySlugAsync(Guid productId, string themeSlug, CancellationToken ct = default);
}
