namespace CoreBackend.API.Models.Responses;

public record BillingPlanResponse(string Key, string Name, string Interval, string Display, string Description);

public record CheckoutSessionResponse(string Url);

public record BillingStatusResponse(string UserType, string? PlanKey, string? Status, DateTime? CurrentPeriodEnd);
