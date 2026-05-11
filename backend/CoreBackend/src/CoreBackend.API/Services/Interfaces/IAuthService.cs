using CoreBackend.API.Models.Responses;

namespace CoreBackend.API.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> CreateGuestAsync(string? deviceToken, CancellationToken ct = default);
    Task<AuthResponse> SignInWithGoogleAsync(string idToken, CancellationToken ct = default);
    Task<AuthResponse> RefreshAsync(string refreshToken, CancellationToken ct = default);
    Task LogoutAsync(string refreshToken, CancellationToken ct = default);
}
