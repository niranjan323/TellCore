using CoreBackend.API.Models.Entities;

namespace CoreBackend.API.Repositories.Interfaces;

public interface INotificationRepository
{
    Task InsertAsync(Notification notification, CancellationToken ct = default);
    Task<IReadOnlyList<Notification>> GetForUserAsync(Guid userId, int limit, CancellationToken ct = default);
    Task MarkReadAsync(Guid notificationId, Guid userId, CancellationToken ct = default);
}
