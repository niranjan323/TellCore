using CoreBackend.API.Models.Responses;

namespace CoreBackend.API.Repositories.Interfaces;

public interface INavigationRepository
{
    Task<IReadOnlyList<NavigationItemResponse>> GetForProductAndRoleAsync(
        Guid productId, string userType, string languageCode, CancellationToken ct = default);
}
