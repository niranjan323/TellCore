using CoreBackend.API.Models.Responses;

namespace CoreBackend.API.Services.Interfaces;

public interface IProfileService
{
    /// <summary>Advances the user's writing streak for today's entry.</summary>
    Task RecordEntryAsync(Guid userId, CancellationToken ct = default);
    Task<StreakResponse> GetStreakAsync(Guid userId, CancellationToken ct = default);
    Task<ProfileStatsResponse> GetStatsAsync(Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<MilestoneResponse>> GetMilestonesAsync(Guid userId, CancellationToken ct = default);
    Task SetProfileVisibilityAsync(Guid userId, bool isProfilePublic, CancellationToken ct = default);
}
