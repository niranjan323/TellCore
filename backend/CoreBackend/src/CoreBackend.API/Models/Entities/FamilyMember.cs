namespace CoreBackend.API.Models.Entities;

public class FamilyMember : BaseEntity
{
    public Guid OwnerUserId { get; set; }
    public Guid? MemberUserId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? Relationship { get; set; }
    public string Status { get; set; } = "invited";         // invited | active
}
