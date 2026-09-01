namespace CoreBackend.API.Models.Entities;

public class VaultInvite : BaseEntity
{
    public Guid OwnerUserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? Relationship { get; set; }
    public DateTime ExpiresAt { get; set; }
    public Guid? UsedByUserId { get; set; }
    public DateTime? UsedAt { get; set; }
}
