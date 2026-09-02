using CoreBackend.API.Models.Entities;
using CoreBackend.API.Repositories.Interfaces;
using Dapper;

namespace CoreBackend.API.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly IDbConnectionFactory _factory;

    public NotificationRepository(IDbConnectionFactory factory) => _factory = factory;

    public async Task InsertAsync(Notification notification, CancellationToken ct = default)
    {
        const string sql = @"
            INSERT INTO dbo.Notifications (Id, UserId, Kind, Title, Body, LinkRoute)
            VALUES (@Id, @UserId, @Kind, @Title, @Body, @LinkRoute)";
        if (notification.Id == Guid.Empty) notification.Id = Guid.NewGuid();
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, notification, cancellationToken: ct));
    }

    public async Task<IReadOnlyList<Notification>> GetForUserAsync(Guid userId, int limit, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT TOP (@Limit) Id, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy, IsDeleted,
                   UserId, Kind, Title, Body, LinkRoute, IsRead
            FROM dbo.Notifications
            WHERE UserId = @UserId AND IsDeleted = 0
            ORDER BY CreatedAt DESC";
        using var conn = _factory.CreateConnection();
        var rows = await conn.QueryAsync<Notification>(
            new CommandDefinition(sql, new { UserId = userId, Limit = limit }, cancellationToken: ct));
        return rows.AsList();
    }

    public async Task MarkReadAsync(Guid notificationId, Guid userId, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE dbo.Notifications
            SET IsRead = 1, UpdatedAt = SYSUTCDATETIME(), UpdatedBy = @UserId
            WHERE Id = @Id AND UserId = @UserId AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, new { Id = notificationId, UserId = userId }, cancellationToken: ct));
    }
}
