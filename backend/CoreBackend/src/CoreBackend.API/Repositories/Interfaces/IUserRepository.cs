using CoreBackend.API.Models.Entities;

namespace CoreBackend.API.Repositories.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<User?> GetByGoogleIdAsync(string googleId, CancellationToken ct = default);
    Task<User?> GetByDeviceTokenAsync(string deviceToken, CancellationToken ct = default);
    Task InsertAsync(User user, CancellationToken ct = default);
    Task UpdateLastLoginAsync(Guid userId, CancellationToken ct = default);
    Task UpdateProfileAsync(User user, CancellationToken ct = default);
    Task SoftDeleteAsync(Guid userId, CancellationToken ct = default);

    Task InsertRefreshTokenAsync(RefreshToken token, CancellationToken ct = default);
    Task<RefreshToken?> GetRefreshTokenAsync(string token, CancellationToken ct = default);
    Task RevokeRefreshTokenAsync(string token, string? replacedBy, CancellationToken ct = default);
    Task RevokeAllRefreshTokensForUserAsync(Guid userId, CancellationToken ct = default);
}
