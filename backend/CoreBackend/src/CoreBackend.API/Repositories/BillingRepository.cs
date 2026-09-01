using CoreBackend.API.Models.Entities;
using CoreBackend.API.Repositories.Interfaces;
using Dapper;

namespace CoreBackend.API.Repositories;

public class BillingRepository : IBillingRepository
{
    private readonly IDbConnectionFactory _factory;

    public BillingRepository(IDbConnectionFactory factory) => _factory = factory;

    public async Task UpsertSubscriptionAsync(Subscription subscription, CancellationToken ct = default)
    {
        const string sql = @"
            MERGE dbo.Subscriptions AS target
            USING (SELECT @StripeSubscriptionId AS StripeSubscriptionId) AS src
            ON target.StripeSubscriptionId = src.StripeSubscriptionId AND target.IsDeleted = 0
            WHEN MATCHED THEN
                UPDATE SET PlanKey = @PlanKey, Status = @Status, CurrentPeriodEnd = @CurrentPeriodEnd,
                           StripeCustomerId = @StripeCustomerId, UpdatedAt = SYSUTCDATETIME()
            WHEN NOT MATCHED THEN
                INSERT (UserId, StripeCustomerId, StripeSubscriptionId, PlanKey, Status, CurrentPeriodEnd, CreatedBy)
                VALUES (@UserId, @StripeCustomerId, @StripeSubscriptionId, @PlanKey, @Status, @CurrentPeriodEnd, @UserId);";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, subscription, cancellationToken: ct));
    }

    public async Task<Subscription?> GetLatestForUserAsync(Guid userId, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT TOP 1 Id, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy, IsDeleted,
                   UserId, StripeCustomerId, StripeSubscriptionId, PlanKey, Status, CurrentPeriodEnd
            FROM dbo.Subscriptions
            WHERE UserId = @UserId AND IsDeleted = 0
            ORDER BY CreatedAt DESC";
        using var conn = _factory.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<Subscription>(
            new CommandDefinition(sql, new { UserId = userId }, cancellationToken: ct));
    }

    public async Task<Subscription?> GetByStripeSubscriptionIdAsync(string stripeSubscriptionId, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT TOP 1 Id, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy, IsDeleted,
                   UserId, StripeCustomerId, StripeSubscriptionId, PlanKey, Status, CurrentPeriodEnd
            FROM dbo.Subscriptions
            WHERE StripeSubscriptionId = @StripeSubscriptionId AND IsDeleted = 0";
        using var conn = _factory.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<Subscription>(
            new CommandDefinition(sql, new { StripeSubscriptionId = stripeSubscriptionId }, cancellationToken: ct));
    }

    public async Task<bool> TryInsertEventAsync(PaymentEvent paymentEvent, CancellationToken ct = default)
    {
        const string sql = @"
            IF NOT EXISTS (SELECT 1 FROM dbo.PaymentEvents WHERE StripeEventId = @StripeEventId)
            BEGIN
                INSERT INTO dbo.PaymentEvents (Id, StripeEventId, EventType, PayloadJson)
                VALUES (@Id, @StripeEventId, @EventType, @PayloadJson);
                SELECT CAST(1 AS BIT);
            END
            ELSE
                SELECT CAST(0 AS BIT);";
        if (paymentEvent.Id == Guid.Empty) paymentEvent.Id = Guid.NewGuid();
        using var conn = _factory.CreateConnection();
        return await conn.ExecuteScalarAsync<bool>(new CommandDefinition(sql, paymentEvent, cancellationToken: ct));
    }

    public async Task MarkEventProcessedAsync(string stripeEventId, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE dbo.PaymentEvents
            SET ProcessedAt = SYSUTCDATETIME(), UpdatedAt = SYSUTCDATETIME()
            WHERE StripeEventId = @StripeEventId";
        using var conn = _factory.CreateConnection();
        await conn.ExecuteAsync(new CommandDefinition(sql, new { StripeEventId = stripeEventId }, cancellationToken: ct));
    }
}
