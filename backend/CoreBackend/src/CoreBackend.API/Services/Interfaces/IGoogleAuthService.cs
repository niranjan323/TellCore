namespace CoreBackend.API.Services.Interfaces;

public interface IGoogleAuthService
{
    Task<GoogleUserPayload?> ValidateIdTokenAsync(string idToken, CancellationToken ct = default);
}

public record GoogleUserPayload(string GoogleId, string Email, string? Name);
