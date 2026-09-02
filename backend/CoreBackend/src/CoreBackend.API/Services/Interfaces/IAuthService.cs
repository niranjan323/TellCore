using CoreBackend.API.Models.Responses;

namespace CoreBackend.API.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> CreateGuestAsync(string? deviceToken, CancellationToken ct = default);
    Task<AuthResponse> SignInWithGoogleAsync(string idToken, CancellationToken ct = default);
    /// <summary>Error codes: invalid_email, weak_password, email_in_use, email_uses_google.</summary>
    Task<(AuthResponse? Result, string? Error)> RegisterAsync(string email, string password, string? name, CancellationToken ct = default);
    /// <summary>Error codes: invalid_credentials.</summary>
    Task<(AuthResponse? Result, string? Error)> LoginWithPasswordAsync(string email, string password, CancellationToken ct = default);
    /// <summary>Sign-in methods the frontends should offer, from Settings 'auth.methods'.</summary>
    Task<IReadOnlyList<string>> GetEnabledMethodsAsync(CancellationToken ct = default);
    Task<AuthResponse> RefreshAsync(string refreshToken, CancellationToken ct = default);
    Task LogoutAsync(string refreshToken, CancellationToken ct = default);
}
