using CoreBackend.API.Models.Entities;

namespace CoreBackend.API.Repositories.Interfaces;

public interface IAnswerRepository
{
    Task UpsertBulkAsync(IEnumerable<Answer> answers, CancellationToken ct = default);
    Task<IReadOnlyList<Answer>> GetForSessionAsync(Guid sessionId, CancellationToken ct = default);
}
