namespace CoreBackend.API.Models.Entities;

public class AuditLog : BaseEntity
{
    public Guid? UserId { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public Guid? EntityId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? PayloadJson { get; set; }
    public string? IpAddress { get; set; }
}
