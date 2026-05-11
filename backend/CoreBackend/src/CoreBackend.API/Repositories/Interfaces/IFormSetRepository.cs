using CoreBackend.API.Models.Entities;
using CoreBackend.API.Models.Responses;

namespace CoreBackend.API.Repositories.Interfaces;

public interface IFormSetRepository
{
    Task<FormSet?> GetDefaultAsync(Guid productId, CancellationToken ct = default);
    Task<FormSet?> GetBySlugAsync(Guid productId, string slug, CancellationToken ct = default);
    Task<FormSet?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<FormSetResponse?> LoadFullAsync(Guid formSetId, string languageCode, CancellationToken ct = default);
    Task<IReadOnlyList<SummaryTemplate>> GetSummaryTemplatesAsync(Guid formSetId, CancellationToken ct = default);
    Task<IReadOnlyList<Question>> GetQuestionsAsync(Guid formSetId, CancellationToken ct = default);
}
