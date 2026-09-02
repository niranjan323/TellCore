using CoreBackend.API.Models.Responses;

namespace CoreBackend.API.Services.Interfaces;

public interface INotificationService
{
    Task<IReadOnlyList<NotificationResponse>> GetForUserAsync(Guid userId, CancellationToken ct = default);
    Task MarkReadAsync(Guid notificationId, Guid userId, CancellationToken ct = default);
}
