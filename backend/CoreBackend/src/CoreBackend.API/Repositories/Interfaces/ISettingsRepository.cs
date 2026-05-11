using CoreBackend.API.Models.Entities;

namespace CoreBackend.API.Repositories.Interfaces;

public interface ISettingsRepository
{
    Task<Setting?> GetByKeyAsync(string key, Guid? productId = null, CancellationToken ct = default);
    Task<string?> GetValueAsync(string key, Guid? productId = null, CancellationToken ct = default);
    Task<IReadOnlyList<Setting>> GetAllAsync(Guid? productId = null, bool includeSecrets = false, CancellationToken ct = default);
    Task UpsertAsync(Setting setting, CancellationToken ct = default);
}
