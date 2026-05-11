using CoreBackend.API.Models.Entities;
using CoreBackend.API.Models.Responses;

namespace CoreBackend.API.Repositories.Interfaces;

public interface ISummaryRepository
{
    Task InsertAsync(Summary summary, CancellationToken ct = default);
    Task<SummaryResponse?> GetLatestForSessionAsync(Guid sessionId, CancellationToken ct = default);
}
