namespace CoreBackend.API.Models.Requests;

public class CreateCheckoutSessionRequest
{
    public string PlanKey { get; set; } = "premium-monthly";
    public string SuccessUrl { get; set; } = string.Empty;
    public string CancelUrl { get; set; } = string.Empty;
}
