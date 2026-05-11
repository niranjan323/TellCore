using CoreBackend.API.Models.Entities;
using CoreBackend.API.Models.Responses;

namespace CoreBackend.API.Repositories.Interfaces;

public interface ISessionRepository
{
    Task InsertAsync(Session session, CancellationToken ct = default);
    Task<Session?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task UpdateVoiceAsync(Guid sessionId, string voiceUrl, string? transcript, CancellationToken ct = default);
    Task MarkCompletedAsync(Guid sessionId, CancellationToken ct = default);
    Task SoftDeleteAllForUserAsync(Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<SessionHistoryItem>> GetHistoryForUserAsync(Guid userId, CancellationToken ct = default);
}
