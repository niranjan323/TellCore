using CoreBackend.API.Models.Entities;

namespace CoreBackend.API.Repositories.Interfaces;

/// <summary>Family member row joined with the joined user's account fields.</summary>
public class FamilyMemberRow : FamilyMember
{
    public string? MemberEmail { get; set; }
    public string? MemberName { get; set; }
}

public interface IFamilyRepository
{
    Task InsertInviteAsync(VaultInvite invite, CancellationToken ct = default);
    Task<VaultInvite?> GetInviteByTokenAsync(string token, CancellationToken ct = default);
    Task MarkInviteUsedAsync(Guid inviteId, Guid usedByUserId, CancellationToken ct = default);

    Task InsertMemberAsync(FamilyMember member, CancellationToken ct = default);
    Task<IReadOnlyList<FamilyMemberRow>> GetMembersAsync(Guid ownerUserId, CancellationToken ct = default);
    Task<IReadOnlyList<Guid>> GetOwnersForMemberAsync(Guid memberUserId, CancellationToken ct = default);
    Task<bool> IsMemberAsync(Guid ownerUserId, Guid memberUserId, CancellationToken ct = default);
    Task SoftDeleteMemberAsync(Guid memberRowId, Guid ownerUserId, CancellationToken ct = default);
}
