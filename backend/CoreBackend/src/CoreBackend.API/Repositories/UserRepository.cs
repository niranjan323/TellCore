using CoreBackend.API.Models.Entities;
using CoreBackend.API.Repositories.Interfaces;
using Dapper;

namespace CoreBackend.API.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IDbConnectionFactory _factory;

    public UserRepository(IDbConnectionFactory factory) => _factory = factory;

    private const string UserColumns = @"
        Id, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy, IsDeleted,
        UserType, Email, Name, GoogleId, PasswordHash, DeviceToken, PreferredLanguage,
        SubscriptionExpiresAt, LastLoginAt, IsProfilePublic";

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var sql = $"SELECT TOP 1 {UserColumns} FROM dbo.Users WHERE Id = @Id AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<User>(
            new CommandDefinition(sql, new { Id = id }, cancellationToken: ct));
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
    {
        var sql = $"SELECT TOP 1 {UserColumns} FROM dbo.Users WHERE Email = @Email AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<User>(
            new CommandDefinition(sql, new { Email = email }, cancellationToken: ct));
    }

    public async Task<User?> GetByGoogleIdAsync(string googleId, CancellationToken ct = default)
    {
        var sql = $"SELECT TOP 1 {UserColumns} FROM dbo.Users WHERE GoogleId = @GoogleId AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<User>(
            new CommandDefinition(sql, new { GoogleId = googleId }, cancellationToken: ct));
    }

    public async Task<User?> GetByDeviceTokenAsync(string deviceToken, CancellationToken ct = default)
    {
        var sql = $@"
            SELECT TOP 1 {UserColumns}
            FROM dbo.Users
            WHERE DeviceToken = @DeviceToken AND UserType = 'guest' AND IsDeleted = 0
            ORDER BY CreatedAt DESC";
        using var conn = _factory.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<User>(
            new CommandDefinition(sql, new { DeviceToken = deviceToken }, cancellationToken: ct));
    }

    public async Task InsertAsync(User user, CancellationToken ct = default)
    {
        const string sql = @"
            INSERT INTO dbo.Users
                (Id, UserType, Email, Name, GoogleId, PasswordHash, DeviceToken, PreferredLanguage,
                 SubscriptionExpiresAt, LastLoginAt, CreatedAt)
            VALUES
                (@Id, @UserType, @Email, @Name, @GoogleId, @PasswordHash, @DeviceToken, @PreferredLanguage,
                 @SubscriptionExpiresAt, @LastLoginAt, SYSUTCDATETIME())";

        if (user.Id == Guid.Empty) user.Id = Guid.NewGuid();
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, user, cancellationToken: ct));
    }

    public async Task UpdateLastLoginAsync(Guid userId, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE dbo.Users SET LastLoginAt = SYSUTCDATETIME(), UpdatedAt = SYSUTCDATETIME()
            WHERE Id = @Id AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, new { Id = userId }, cancellationToken: ct));
    }

    public async Task UpdateProfileAsync(User user, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE dbo.Users
            SET Email = @Email, Name = @Name, GoogleId = @GoogleId,
                PreferredLanguage = @PreferredLanguage, UserType = @UserType,
                UpdatedAt = SYSUTCDATETIME(), UpdatedBy = @Id
            WHERE Id = @Id AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, user, cancellationToken: ct));
    }

    public async Task SetUserTypeAsync(Guid userId, string userType, DateTime? subscriptionExpiresAt, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE dbo.Users
            SET UserType = @UserType, SubscriptionExpiresAt = @SubscriptionExpiresAt,
                UpdatedAt = SYSUTCDATETIME(), UpdatedBy = @Id
            WHERE Id = @Id AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql,
            new { Id = userId, UserType = userType, SubscriptionExpiresAt = subscriptionExpiresAt }, cancellationToken: ct));
    }

    public async Task SetProfileVisibilityAsync(Guid userId, bool isProfilePublic, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE dbo.Users
            SET IsProfilePublic = @IsProfilePublic, UpdatedAt = SYSUTCDATETIME(), UpdatedBy = @Id
            WHERE Id = @Id AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql,
            new { Id = userId, IsProfilePublic = isProfilePublic }, cancellationToken: ct));
    }

    public async Task SoftDeleteAsync(Guid userId, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE dbo.Users SET IsDeleted = 1, UpdatedAt = SYSUTCDATETIME(), UpdatedBy = @Id
            WHERE Id = @Id";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, new { Id = userId }, cancellationToken: ct));
    }

    public async Task InsertRefreshTokenAsync(RefreshToken token, CancellationToken ct = default)
    {
        const string sql = @"
            INSERT INTO dbo.RefreshTokens
                (Id, UserId, Token, ExpiresAt, RevokedAt, ReplacedByToken, CreatedAt)
            VALUES
                (@Id, @UserId, @Token, @ExpiresAt, @RevokedAt, @ReplacedByToken, SYSUTCDATETIME())";
        if (token.Id == Guid.Empty) token.Id = Guid.NewGuid();
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, token, cancellationToken: ct));
    }

    public async Task<RefreshToken?> GetRefreshTokenAsync(string token, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT TOP 1 Id, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy, IsDeleted,
                   UserId, Token, ExpiresAt, RevokedAt, ReplacedByToken
            FROM dbo.RefreshTokens
            WHERE Token = @Token AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<RefreshToken>(
            new CommandDefinition(sql, new { Token = token }, cancellationToken: ct));
    }

    public async Task RevokeRefreshTokenAsync(string token, string? replacedBy, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE dbo.RefreshTokens
            SET RevokedAt = SYSUTCDATETIME(), ReplacedByToken = @ReplacedBy, UpdatedAt = SYSUTCDATETIME()
            WHERE Token = @Token AND RevokedAt IS NULL";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, new { Token = token, ReplacedBy = replacedBy }, cancellationToken: ct));
    }

    public async Task RevokeAllRefreshTokensForUserAsync(Guid userId, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE dbo.RefreshTokens
            SET RevokedAt = SYSUTCDATETIME(), UpdatedAt = SYSUTCDATETIME()
            WHERE UserId = @UserId AND RevokedAt IS NULL";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, new { UserId = userId }, cancellationToken: ct));
    }
}
