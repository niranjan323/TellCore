using System.Text.Json;
using CoreBackend.API.Models.Requests;
using CoreBackend.API.Models.Responses;
using CoreBackend.API.Repositories.Interfaces;
using CoreBackend.API.Services.Interfaces;
using Stripe;
using Stripe.Checkout;
using SubscriptionEntity = CoreBackend.API.Models.Entities.Subscription;

namespace CoreBackend.API.Services;

public class BillingService : IBillingService
{
    private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);

    private readonly ISettingsRepository _settings;
    private readonly IBillingRepository _billing;
    private readonly IUserRepository _users;
    private readonly ILogger<BillingService> _logger;

    public BillingService(
        ISettingsRepository settings,
        IBillingRepository billing,
        IUserRepository users,
        ILogger<BillingService> logger)
    {
        _settings = settings;
        _billing = billing;
        _users = users;
        _logger = logger;
    }

    private sealed record PlanDef(string Key, string Name, string Interval, string Display, string Description);

    public async Task<IReadOnlyList<BillingPlanResponse>> GetPlansAsync(CancellationToken ct = default)
    {
        var json = await _settings.GetValueAsync("payments.plans", ct: ct);
        if (string.IsNullOrWhiteSpace(json)) return Array.Empty<BillingPlanResponse>();
        var plans = JsonSerializer.Deserialize<List<PlanDef>>(json, JsonOpts) ?? new List<PlanDef>();
        return plans.Select(p => new BillingPlanResponse(p.Key, p.Name, p.Interval, p.Display, p.Description)).ToList();
    }

    public async Task<(CheckoutSessionResponse? Result, string? Error)> CreateCheckoutSessionAsync(
        Guid userId, CreateCheckoutSessionRequest request, CancellationToken ct = default)
    {
        var secretKey = await GetConfiguredValueAsync("payments.stripe.secretkey", ct);
        if (secretKey is null) return (null, "billing_not_configured");

        var priceKey = request.PlanKey == "premium-yearly"
            ? "payments.stripe.price.yearly"
            : "payments.stripe.price.monthly";
        var priceId = await GetConfiguredValueAsync(priceKey, ct);
        if (priceId is null) return (null, "billing_not_configured");

        if (string.IsNullOrWhiteSpace(request.SuccessUrl) || string.IsNullOrWhiteSpace(request.CancelUrl))
            return (null, "invalid_urls");

        var user = await _users.GetByIdAsync(userId, ct);
        if (user is null) return (null, "not_found");

        var client = new StripeClient(secretKey);
        var metadata = new Dictionary<string, string>
        {
            ["userId"] = userId.ToString(),
            ["planKey"] = request.PlanKey,
        };
        var session = await new SessionService(client).CreateAsync(new SessionCreateOptions
        {
            Mode = "subscription",
            LineItems = new List<SessionLineItemOptions>
            {
                new() { Price = priceId, Quantity = 1 },
            },
            SuccessUrl = request.SuccessUrl,
            CancelUrl = request.CancelUrl,
            ClientReferenceId = userId.ToString(),
            CustomerEmail = user.Email,
            Metadata = metadata,
            SubscriptionData = new SessionSubscriptionDataOptions { Metadata = metadata },
        }, cancellationToken: ct);

        return (new CheckoutSessionResponse(session.Url), null);
    }

    public async Task HandleWebhookAsync(string json, string signatureHeader, CancellationToken ct = default)
    {
        var webhookSecret = await GetConfiguredValueAsync("payments.stripe.webhooksecret", ct)
            ?? throw new InvalidOperationException("Stripe webhook secret is not configured.");

        var stripeEvent = EventUtility.ConstructEvent(json, signatureHeader, webhookSecret, throwOnApiVersionMismatch: false);

        var isNew = await _billing.TryInsertEventAsync(new Models.Entities.PaymentEvent
        {
            StripeEventId = stripeEvent.Id,
            EventType = stripeEvent.Type,
            PayloadJson = json,
        }, ct);
        if (!isNew)
        {
            _logger.LogInformation("Stripe event {EventId} already processed — skipping", stripeEvent.Id);
            return;
        }

        switch (stripeEvent.Type)
        {
            case "checkout.session.completed":
                await HandleCheckoutCompletedAsync((Session)stripeEvent.Data.Object, ct);
                break;
            case "customer.subscription.updated":
            case "customer.subscription.deleted":
                await HandleSubscriptionChangedAsync((Stripe.Subscription)stripeEvent.Data.Object, ct);
                break;
            default:
                _logger.LogInformation("Ignoring Stripe event type {Type}", stripeEvent.Type);
                break;
        }

        await _billing.MarkEventProcessedAsync(stripeEvent.Id, ct);
    }

    private async Task HandleCheckoutCompletedAsync(Session session, CancellationToken ct)
    {
        if (!Guid.TryParse(session.ClientReferenceId, out var userId))
        {
            _logger.LogWarning("checkout.session.completed without a usable clientReferenceId");
            return;
        }
        var planKey = session.Metadata.TryGetValue("planKey", out var pk) ? pk : "premium-monthly";

        DateTime? periodEnd = null;
        var status = "active";
        if (!string.IsNullOrEmpty(session.SubscriptionId))
        {
            var secretKey = await GetConfiguredValueAsync("payments.stripe.secretkey", ct);
            if (secretKey is not null)
            {
                var sub = await new SubscriptionService(new StripeClient(secretKey))
                    .GetAsync(session.SubscriptionId, cancellationToken: ct);
                periodEnd = GetPeriodEnd(sub);
                status = sub.Status;
            }
        }

        await _billing.UpsertSubscriptionAsync(new SubscriptionEntity
        {
            UserId = userId,
            StripeCustomerId = session.CustomerId ?? string.Empty,
            StripeSubscriptionId = session.SubscriptionId ?? $"one-off:{session.Id}",
            PlanKey = planKey,
            Status = status,
            CurrentPeriodEnd = periodEnd,
        }, ct);

        await _users.SetUserTypeAsync(userId, "paid", periodEnd, ct);
        _logger.LogInformation("User {UserId} upgraded to paid ({PlanKey})", userId, planKey);
    }

    private async Task HandleSubscriptionChangedAsync(Stripe.Subscription sub, CancellationToken ct)
    {
        var existing = await _billing.GetByStripeSubscriptionIdAsync(sub.Id, ct);
        Guid userId;
        if (existing is not null) userId = existing.UserId;
        else if (sub.Metadata.TryGetValue("userId", out var uid) && Guid.TryParse(uid, out var parsed)) userId = parsed;
        else
        {
            _logger.LogWarning("Subscription event {SubId} has no known user — skipping", sub.Id);
            return;
        }

        var periodEnd = GetPeriodEnd(sub);
        await _billing.UpsertSubscriptionAsync(new SubscriptionEntity
        {
            UserId = userId,
            StripeCustomerId = sub.CustomerId ?? existing?.StripeCustomerId ?? string.Empty,
            StripeSubscriptionId = sub.Id,
            PlanKey = existing?.PlanKey ?? (sub.Metadata.TryGetValue("planKey", out var plan) ? plan : "premium-monthly"),
            Status = sub.Status,
            CurrentPeriodEnd = periodEnd,
        }, ct);

        var isActive = sub.Status is "active" or "trialing";
        var user = await _users.GetByIdAsync(userId, ct);
        if (user is null) return;

        if (isActive)
        {
            await _users.SetUserTypeAsync(userId, "paid", periodEnd, ct);
        }
        else if (user.UserType == "paid")
        {
            await _users.SetUserTypeAsync(userId, "registered", null, ct);
            _logger.LogInformation("User {UserId} downgraded to registered (subscription {Status})", userId, sub.Status);
        }
    }

    public async Task<BillingStatusResponse?> GetStatusAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _users.GetByIdAsync(userId, ct);
        if (user is null) return null;
        var sub = await _billing.GetLatestForUserAsync(userId, ct);
        return new BillingStatusResponse(user.UserType, sub?.PlanKey, sub?.Status, sub?.CurrentPeriodEnd);
    }

    private async Task<string?> GetConfiguredValueAsync(string key, CancellationToken ct)
    {
        var value = await _settings.GetValueAsync(key, ct: ct);
        return string.IsNullOrWhiteSpace(value) || value.StartsWith("YOUR_", StringComparison.Ordinal) ? null : value;
    }

    private static DateTime? GetPeriodEnd(Stripe.Subscription sub) =>
        sub.Items?.Data?.FirstOrDefault()?.CurrentPeriodEnd;
}
