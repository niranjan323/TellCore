using CoreBackend.API.Models.Requests;
using CoreBackend.API.Models.Responses;

namespace CoreBackend.API.Services.Interfaces;

public interface IResponseService
{
    Task<SummaryResponse> SubmitAsync(SubmitResponseRequest request, Guid userId, CancellationToken ct = default);
    Task<SummaryResponse?> GetSummaryAsync(Guid sessionId, Guid userId, CancellationToken ct = default);
}
