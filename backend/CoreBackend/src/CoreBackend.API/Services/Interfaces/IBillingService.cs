using CoreBackend.API.Models.Requests;
using CoreBackend.API.Models.Responses;

namespace CoreBackend.API.Services.Interfaces;

public interface IBillingService
{
    Task<IReadOnlyList<BillingPlanResponse>> GetPlansAsync(CancellationToken ct = default);
    Task<(CheckoutSessionResponse? Result, string? Error)> CreateCheckoutSessionAsync(Guid userId, CreateCheckoutSessionRequest request, CancellationToken ct = default);
    /// <summary>Verifies the Stripe signature, records the event idempotently, and applies it. Throws on invalid signatures.</summary>
    Task HandleWebhookAsync(string json, string signatureHeader, CancellationToken ct = default);
    Task<BillingStatusResponse?> GetStatusAsync(Guid userId, CancellationToken ct = default);
    /// <summary>Stripe customer portal for managing/cancelling a subscription. Null result + error code when unavailable.</summary>
    Task<(CheckoutSessionResponse? Result, string? Error)> CreatePortalSessionAsync(Guid userId, string returnUrl, CancellationToken ct = default);
}
