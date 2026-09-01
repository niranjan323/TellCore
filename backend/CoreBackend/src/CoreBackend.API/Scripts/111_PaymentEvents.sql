-- Stripe webhook event log. StripeEventId is unique → webhook idempotency:
-- an event already present is acknowledged without being re-processed.
IF OBJECT_ID('dbo.PaymentEvents','U') IS NULL
BEGIN
    CREATE TABLE dbo.PaymentEvents (
        Id            UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_PaymentEvents_Id DEFAULT NEWID(),
        CreatedAt     DATETIME2        NOT NULL CONSTRAINT DF_PaymentEvents_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt     DATETIME2        NULL,
        CreatedBy     UNIQUEIDENTIFIER NULL,
        UpdatedBy     UNIQUEIDENTIFIER NULL,
        IsDeleted     BIT              NOT NULL CONSTRAINT DF_PaymentEvents_IsDeleted DEFAULT 0,
        StripeEventId NVARCHAR(100)    NOT NULL,
        EventType     NVARCHAR(100)    NOT NULL,
        PayloadJson   NVARCHAR(MAX)    NOT NULL,
        ProcessedAt   DATETIME2        NULL,
        CONSTRAINT PK_PaymentEvents PRIMARY KEY (Id)
    );
    CREATE UNIQUE INDEX UX_PaymentEvents_StripeEventId ON dbo.PaymentEvents (StripeEventId);
END
GO
