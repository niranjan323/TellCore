using CoreBackend.API.Models.Entities;
using CoreBackend.API.Models.Responses;
using CoreBackend.API.Repositories.Interfaces;
using CoreBackend.API.Services.Interfaces;

namespace CoreBackend.API.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IJwtService _jwt;
    private readonly IGoogleAuthService _google;
    private readonly ISettingsRepository _settings;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository users,
        IJwtService jwt,
        IGoogleAuthService google,
        ISettingsRepository settings,
        IConfiguration config,
        ILogger<AuthService> logger)
    {
        _users = users;
        _jwt = jwt;
        _google = google;
        _settings = settings;
        _config = config;
        _logger = logger;
    }

    public async Task<(AuthResponse? Result, string? Error)> RegisterAsync(string email, string password, string? name, CancellationToken ct = default)
    {
        email = email.Trim().ToLowerInvariant();
        if (email.Length is < 5 or > 200 || !email.Contains('@') || !email.Contains('.'))
            return (null, "invalid_email");
        if (password.Length < 8)
            return (null, "weak_password");

        var existing = await _users.GetByEmailAsync(email, ct);
        if (existing is not null)
            return (null, existing.GoogleId is not null && existing.PasswordHash is null
                ? "email_uses_google"
                : "email_in_use");

        var user = new User
        {
            Id = Guid.NewGuid(),
            UserType = "registered",
            Email = email,
            Name = string.IsNullOrWhiteSpace(name) ? null : name.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            LastLoginAt = DateTime.UtcNow,
        };
        await _users.InsertAsync(user, ct);
        _logger.LogInformation("Created registered user {UserId} via email/password", user.Id);

        var access = _jwt.GenerateAccessToken(user, TimeSpan.FromHours(1));
        var refresh = await CreateRefreshTokenAsync(user.Id, ct);
        return (new AuthResponse(access, refresh, user.UserType, user.Id, user.Email), null);
    }

    public async Task<(AuthResponse? Result, string? Error)> LoginWithPasswordAsync(string email, string password, CancellationToken ct = default)
    {
        email = email.Trim().ToLowerInvariant();
        var user = await _users.GetByEmailAsync(email, ct);
        // Generic failure on purpose — never reveal whether the email exists.
        if (user is null || user.PasswordHash is null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return (null, "invalid_credentials");

        await _users.UpdateLastLoginAsync(user.Id, ct);
        var access = _jwt.GenerateAccessToken(user, TimeSpan.FromHours(1));
        var refresh = await CreateRefreshTokenAsync(user.Id, ct);
        return (new AuthResponse(access, refresh, user.UserType, user.Id, user.Email), null);
    }

    public async Task<IReadOnlyList<string>> GetEnabledMethodsAsync(CancellationToken ct = default)
    {
        var json = await _settings.GetValueAsync("auth.methods", ct: ct);
        if (string.IsNullOrWhiteSpace(json)) return new[] { "google", "password", "guest" };
        try
        {
            return System.Text.Json.JsonSerializer.Deserialize<List<string>>(json) ?? new List<string> { "guest" };
        }
        catch
        {
            return new[] { "guest" };
        }
    }

    public async Task<AuthResponse> CreateGuestAsync(string? deviceToken, CancellationToken ct = default)
    {
        User? user = null;
        if (!string.IsNullOrWhiteSpace(deviceToken))
            user = await _users.GetByDeviceTokenAsync(deviceToken, ct);

        if (user is null)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
                UserType = "guest",
                DeviceToken = deviceToken,
                LastLoginAt = DateTime.UtcNow,
            };
            await _users.InsertAsync(user, ct);
            _logger.LogInformation("Created guest user {UserId}", user.Id);
        }
        else
        {
            await _users.UpdateLastLoginAsync(user.Id, ct);
        }

        var access = _jwt.GenerateAccessToken(user, TimeSpan.FromHours(24));
        var refresh = await CreateRefreshTokenAsync(user.Id, ct);
        return new AuthResponse(access, refresh, user.UserType, user.Id, user.Email);
    }

    public async Task<AuthResponse> SignInWithGoogleAsync(string idToken, CancellationToken ct = default)
    {
        var payload = await _google.ValidateIdTokenAsync(idToken, ct)
            ?? throw new UnauthorizedAccessException("Invalid Google ID token.");

        var user = await _users.GetByGoogleIdAsync(payload.GoogleId, ct);
        if (user is null && !string.IsNullOrEmpty(payload.Email))
            user = await _users.GetByEmailAsync(payload.Email, ct);

        if (user is null)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
                UserType = "registered",
                Email = payload.Email,
                Name = payload.Name,
                GoogleId = payload.GoogleId,
                LastLoginAt = DateTime.UtcNow,
            };
            await _users.InsertAsync(user, ct);
            _logger.LogInformation("Created registered user {UserId} via Google", user.Id);
        }
        else
        {
            user.GoogleId = payload.GoogleId;
            user.Email = payload.Email;
            user.Name = payload.Name;
            if (user.UserType == "guest") user.UserType = "registered";
            await _users.UpdateProfileAsync(user, ct);
            await _users.UpdateLastLoginAsync(user.Id, ct);
        }

        var access = _jwt.GenerateAccessToken(user);
        var refresh = await CreateRefreshTokenAsync(user.Id, ct);
        return new AuthResponse(access, refresh, user.UserType, user.Id, user.Email);
    }

    public async Task<AuthResponse> RefreshAsync(string refreshToken, CancellationToken ct = default)
    {
        var existing = await _users.GetRefreshTokenAsync(refreshToken, ct)
            ?? throw new UnauthorizedAccessException("Refresh token not found.");

        if (existing.RevokedAt is not null)
            throw new UnauthorizedAccessException("Refresh token has been revoked.");
        if (existing.ExpiresAt <= DateTime.UtcNow)
            throw new UnauthorizedAccessException("Refresh token has expired.");

        var user = await _users.GetByIdAsync(existing.UserId, ct)
            ?? throw new UnauthorizedAccessException("User not found.");

        var newRefresh = _jwt.GenerateRefreshToken();
        await _users.RevokeRefreshTokenAsync(existing.Token, newRefresh, ct);
        await _users.InsertRefreshTokenAsync(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = newRefresh,
            ExpiresAt = DateTime.UtcNow.AddDays(GetRefreshDays()),
        }, ct);

        var access = _jwt.GenerateAccessToken(user);
        return new AuthResponse(access, newRefresh, user.UserType, user.Id, user.Email);
    }

    public async Task LogoutAsync(string refreshToken, CancellationToken ct = default)
    {
        await _users.RevokeRefreshTokenAsync(refreshToken, replacedBy: null, ct);
    }

    private async Task<string> CreateRefreshTokenAsync(Guid userId, CancellationToken ct)
    {
        var refresh = _jwt.GenerateRefreshToken();
        await _users.InsertRefreshTokenAsync(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Token = refresh,
            ExpiresAt = DateTime.UtcNow.AddDays(GetRefreshDays()),
        }, ct);
        return refresh;
    }

    private int GetRefreshDays() =>
        int.TryParse(_config["Jwt:RefreshTokenExpiryDays"], out var d) ? d : 30;
}
