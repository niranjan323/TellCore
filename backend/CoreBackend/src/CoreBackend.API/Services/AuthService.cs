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
    private readonly IConfiguration _config;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository users,
        IJwtService jwt,
        IGoogleAuthService google,
        IConfiguration config,
        ILogger<AuthService> logger)
    {
        _users = users;
        _jwt = jwt;
        _google = google;
        _config = config;
        _logger = logger;
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
