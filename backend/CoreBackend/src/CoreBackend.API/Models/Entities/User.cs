namespace CoreBackend.API.Models.Entities;

public class User : BaseEntity
{
    public string UserType { get; set; } = "guest";
    public string? Email { get; set; }
    public string? Name { get; set; }
    public string? GoogleId { get; set; }
    public string? DeviceToken { get; set; }
    public string? PreferredLanguage { get; set; }
    public DateTime? SubscriptionExpiresAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}
