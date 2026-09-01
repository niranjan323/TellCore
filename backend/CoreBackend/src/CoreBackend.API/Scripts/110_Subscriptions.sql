IF OBJECT_ID('dbo.Subscriptions','U') IS NULL
BEGIN
    CREATE TABLE dbo.Subscriptions (
        Id                   UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Subscriptions_Id DEFAULT NEWID(),
        CreatedAt            DATETIME2        NOT NULL CONSTRAINT DF_Subscriptions_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt            DATETIME2        NULL,
        CreatedBy            UNIQUEIDENTIFIER NULL,
        UpdatedBy            UNIQUEIDENTIFIER NULL,
        IsDeleted            BIT              NOT NULL CONSTRAINT DF_Subscriptions_IsDeleted DEFAULT 0,
        UserId               UNIQUEIDENTIFIER NOT NULL,
        StripeCustomerId     NVARCHAR(100)    NOT NULL,
        StripeSubscriptionId NVARCHAR(100)    NOT NULL,
        PlanKey              NVARCHAR(50)     NOT NULL,          -- 'premium-monthly' | 'premium-yearly'
        Status               NVARCHAR(30)     NOT NULL,          -- Stripe status: active | past_due | canceled | ...
        CurrentPeriodEnd     DATETIME2        NULL,
        CONSTRAINT PK_Subscriptions PRIMARY KEY (Id),
        CONSTRAINT FK_Subscriptions_Users FOREIGN KEY (UserId) REFERENCES dbo.Users (Id)
    );
    CREATE UNIQUE INDEX UX_Subscriptions_StripeSubscriptionId
        ON dbo.Subscriptions (StripeSubscriptionId) WHERE IsDeleted = 0;
    CREATE INDEX IX_Subscriptions_User ON dbo.Subscriptions (UserId) WHERE IsDeleted = 0;
END
GO
