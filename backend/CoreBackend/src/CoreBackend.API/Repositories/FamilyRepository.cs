using CoreBackend.API.Models.Entities;
using CoreBackend.API.Repositories.Interfaces;
using Dapper;

namespace CoreBackend.API.Repositories;

public class FamilyRepository : IFamilyRepository
{
    private readonly IDbConnectionFactory _factory;

    public FamilyRepository(IDbConnectionFactory factory) => _factory = factory;

    public async Task InsertInviteAsync(VaultInvite invite, CancellationToken ct = default)
    {
        const string sql = @"
            INSERT INTO dbo.VaultInvites
                (Id, OwnerUserId, Token, DisplayName, Relationship, ExpiresAt, CreatedBy)
            VALUES
                (@Id, @OwnerUserId, @Token, @DisplayName, @Relationship, @ExpiresAt, @OwnerUserId)";
        if (invite.Id == Guid.Empty) invite.Id = Guid.NewGuid();
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, invite, cancellationToken: ct));
    }

    public async Task<VaultInvite?> GetInviteByTokenAsync(string token, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT TOP 1 Id, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy, IsDeleted,
                   OwnerUserId, Token, DisplayName, Relationship, ExpiresAt, UsedByUserId, UsedAt
            FROM dbo.VaultInvites
            WHERE Token = @Token AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<VaultInvite>(
            new CommandDefinition(sql, new { Token = token }, cancellationToken: ct));
    }

    public async Task MarkInviteUsedAsync(Guid inviteId, Guid usedByUserId, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE dbo.VaultInvites
            SET UsedByUserId = @UsedBy, UsedAt = SYSUTCDATETIME(),
                UpdatedAt = SYSUTCDATETIME(), UpdatedBy = @UsedBy
            WHERE Id = @Id AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, new { Id = inviteId, UsedBy = usedByUserId }, cancellationToken: ct));
    }

    public async Task InsertMemberAsync(FamilyMember member, CancellationToken ct = default)
    {
        const string sql = @"
            INSERT INTO dbo.FamilyMembers
                (Id, OwnerUserId, MemberUserId, DisplayName, Relationship, Status, CreatedBy)
            VALUES
                (@Id, @OwnerUserId, @MemberUserId, @DisplayName, @Relationship, @Status, @OwnerUserId)";
        if (member.Id == Guid.Empty) member.Id = Guid.NewGuid();
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, member, cancellationToken: ct));
    }

    public async Task<IReadOnlyList<FamilyMemberRow>> GetMembersAsync(Guid ownerUserId, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT fm.Id, fm.CreatedAt, fm.UpdatedAt, fm.CreatedBy, fm.UpdatedBy, fm.IsDeleted,
                   fm.OwnerUserId, fm.MemberUserId, fm.DisplayName, fm.Relationship, fm.Status,
                   u.Email AS MemberEmail, u.Name AS MemberName
            FROM dbo.FamilyMembers fm
            LEFT JOIN dbo.Users u ON u.Id = fm.MemberUserId AND u.IsDeleted = 0
            WHERE fm.OwnerUserId = @OwnerUserId AND fm.IsDeleted = 0
            ORDER BY fm.CreatedAt";
        using var conn = _factory.CreateConnection();
        var rows = await conn.QueryAsync<FamilyMemberRow>(
            new CommandDefinition(sql, new { OwnerUserId = ownerUserId }, cancellationToken: ct));
        return rows.AsList();
    }

    public async Task<IReadOnlyList<Guid>> GetOwnersForMemberAsync(Guid memberUserId, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT DISTINCT OwnerUserId FROM dbo.FamilyMembers
            WHERE MemberUserId = @MemberUserId AND Status = 'active' AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        var rows = await conn.QueryAsync<Guid>(
            new CommandDefinition(sql, new { MemberUserId = memberUserId }, cancellationToken: ct));
        return rows.AsList();
    }

    public async Task<bool> IsMemberAsync(Guid ownerUserId, Guid memberUserId, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT COUNT(*) FROM dbo.FamilyMembers
            WHERE OwnerUserId = @OwnerUserId AND MemberUserId = @MemberUserId
              AND Status = 'active' AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        var count = await conn.ExecuteScalarAsync<int>(
            new CommandDefinition(sql, new { OwnerUserId = ownerUserId, MemberUserId = memberUserId }, cancellationToken: ct));
        return count > 0;
    }

    public async Task SoftDeleteMemberAsync(Guid memberRowId, Guid ownerUserId, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE dbo.FamilyMembers
            SET IsDeleted = 1, UpdatedAt = SYSUTCDATETIME(), UpdatedBy = @OwnerUserId
            WHERE Id = @Id AND OwnerUserId = @OwnerUserId";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, new { Id = memberRowId, OwnerUserId = ownerUserId }, cancellationToken: ct));
    }
}
