namespace CoreBackend.API.Models.Entities;

public class Subscription : BaseEntity
{
    public Guid UserId { get; set; }
    public string StripeCustomerId { get; set; } = string.Empty;
    public string StripeSubscriptionId { get; set; } = string.Empty;
    public string PlanKey { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? CurrentPeriodEnd { get; set; }
}
