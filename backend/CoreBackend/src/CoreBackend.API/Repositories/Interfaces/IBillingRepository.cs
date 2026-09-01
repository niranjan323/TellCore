using CoreBackend.API.Models.Entities;

namespace CoreBackend.API.Repositories.Interfaces;

public interface IBillingRepository
{
    Task UpsertSubscriptionAsync(Subscription subscription, CancellationToken ct = default);
    Task<Subscription?> GetLatestForUserAsync(Guid userId, CancellationToken ct = default);
    Task<Subscription?> GetByStripeSubscriptionIdAsync(string stripeSubscriptionId, CancellationToken ct = default);

    /// <summary>Returns false when the event was already recorded (idempotency guard).</summary>
    Task<bool> TryInsertEventAsync(PaymentEvent paymentEvent, CancellationToken ct = default);
    Task MarkEventProcessedAsync(string stripeEventId, CancellationToken ct = default);
}
