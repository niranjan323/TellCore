using System.Security.Cryptography;
using CoreBackend.API.Models.Entities;
using CoreBackend.API.Models.Requests;
using CoreBackend.API.Models.Responses;
using CoreBackend.API.Repositories.Interfaces;
using CoreBackend.API.Services.Interfaces;

namespace CoreBackend.API.Services;

public class VaultService : IVaultService
{
    private const int InviteExpiryDays = 7;

    private readonly IFamilyRepository _family;
    private readonly IUserRepository _users;
    private readonly INotificationRepository _notifications;
    private readonly ISettingsRepository _settings;

    public VaultService(
        IFamilyRepository family,
        IUserRepository users,
        INotificationRepository notifications,
        ISettingsRepository settings)
    {
        _family = family;
        _users = users;
        _notifications = notifications;
        _settings = settings;
    }

    public async Task<VaultInviteResponse> CreateInviteAsync(Guid ownerUserId, CreateVaultInviteRequest request, CancellationToken ct = default)
    {
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace('+', '-').Replace('/', '_').TrimEnd('=');

        var invite = new VaultInvite
        {
            OwnerUserId = ownerUserId,
            Token = token,
            DisplayName = request.DisplayName,
            Relationship = request.Relationship,
            ExpiresAt = DateTime.UtcNow.AddDays(InviteExpiryDays),
        };
        await _family.InsertInviteAsync(invite, ct);

        var appBaseUrl = await _settings.GetValueAsync("app.theuntold.baseurl", ct: ct) ?? "http://localhost:5174";
        var inviteUrl = $"{appBaseUrl.TrimEnd('/')}/vault/join/{token}";
        return new VaultInviteResponse(token, inviteUrl, invite.ExpiresAt);
    }

    public async Task<(AcceptInviteResponse? Result, string? Error)> AcceptInviteAsync(string token, Guid userId, CancellationToken ct = default)
    {
        var invite = await _family.GetInviteByTokenAsync(token, ct);
        if (invite is null) return (null, "not_found");
        if (invite.UsedByUserId is not null) return (null, "invite_used");
        if (invite.ExpiresAt < DateTime.UtcNow) return (null, "invite_expired");
        if (invite.OwnerUserId == userId) return (null, "invite_own");
        if (await _family.IsMemberAsync(invite.OwnerUserId, userId, ct)) return (null, "already_member");

        var member = await _users.GetByIdAsync(userId, ct);
        if (member is null) return (null, "not_found");

        await _family.InsertMemberAsync(new FamilyMember
        {
            OwnerUserId = invite.OwnerUserId,
            MemberUserId = userId,
            DisplayName = member.Name ?? invite.DisplayName ?? "Family member",
            Relationship = invite.Relationship,
            Status = "active",
        }, ct);
        await _family.MarkInviteUsedAsync(invite.Id, userId, ct);

        var owner = await _users.GetByIdAsync(invite.OwnerUserId, ct);
        await _notifications.InsertAsync(new Notification
        {
            UserId = invite.OwnerUserId,
            Kind = "family-shared",
            Title = $"{member.Name ?? "Someone"} joined your vault",
            Body = "They can now read the stories you share with family.",
            LinkRoute = "/vault",
        }, ct);

        return (new AcceptInviteResponse(invite.OwnerUserId, owner?.Name ?? "A storyteller"), null);
    }

    public async Task<IReadOnlyList<FamilyMemberResponse>> GetMembersAsync(Guid ownerUserId, CancellationToken ct = default)
    {
        var rows = await _family.GetMembersAsync(ownerUserId, ct);
        return rows.Select(r => new FamilyMemberResponse(
            r.Id,
            r.MemberName ?? r.DisplayName,
            r.MemberEmail ?? string.Empty,
            r.Status,
            null)).ToList();
    }

    public async Task<string?> RemoveMemberAsync(Guid memberRowId, Guid ownerUserId, CancellationToken ct = default)
    {
        await _family.SoftDeleteMemberAsync(memberRowId, ownerUserId, ct);
        return null;
    }

    public async Task<IReadOnlyList<Guid>> GetVaultOwnerIdsForViewerAsync(Guid viewerUserId, CancellationToken ct = default)
    {
        var owners = (await _family.GetOwnersForMemberAsync(viewerUserId, ct)).ToList();
        owners.Add(viewerUserId);
        return owners;
    }
}
