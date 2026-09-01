using CoreBackend.API.Models.Responses;
using CoreBackend.API.Repositories.Interfaces;
using CoreBackend.API.Services.Interfaces;

namespace CoreBackend.API.Services;

public class NotificationService : INotificationService
{
    private const int MaxNotifications = 50;

    private readonly INotificationRepository _notifications;

    public NotificationService(INotificationRepository notifications) => _notifications = notifications;

    public async Task<IReadOnlyList<NotificationResponse>> GetForUserAsync(Guid userId, CancellationToken ct = default)
    {
        var rows = await _notifications.GetForUserAsync(userId, MaxNotifications, ct);
        return rows.Select(n => new NotificationResponse(
            n.Id, n.Kind, n.Title, n.Body ?? string.Empty, n.CreatedAt, n.IsRead, n.LinkRoute)).ToList();
    }

    public Task MarkReadAsync(Guid notificationId, Guid userId, CancellationToken ct = default)
        => _notifications.MarkReadAsync(notificationId, userId, ct);
}
