using CoreBackend.API.Models.Requests;
using CoreBackend.API.Models.Responses;

namespace CoreBackend.API.Services.Interfaces;

public interface IVaultService
{
    Task<VaultInviteResponse> CreateInviteAsync(Guid ownerUserId, CreateVaultInviteRequest request, CancellationToken ct = default);
    Task<(AcceptInviteResponse? Result, string? Error)> AcceptInviteAsync(string token, Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<FamilyMemberResponse>> GetMembersAsync(Guid ownerUserId, CancellationToken ct = default);
    Task<string?> RemoveMemberAsync(Guid memberRowId, Guid ownerUserId, CancellationToken ct = default);
    Task<IReadOnlyList<Guid>> GetVaultOwnerIdsForViewerAsync(Guid viewerUserId, CancellationToken ct = default);
}
