IF OBJECT_ID('dbo.Users','U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        Id                    UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Users_Id DEFAULT NEWID(),
        CreatedAt             DATETIME2        NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt             DATETIME2        NULL,
        CreatedBy             UNIQUEIDENTIFIER NULL,
        UpdatedBy             UNIQUEIDENTIFIER NULL,
        IsDeleted             BIT              NOT NULL CONSTRAINT DF_Users_IsDeleted DEFAULT 0,
        UserType              NVARCHAR(20)     NOT NULL CONSTRAINT DF_Users_UserType DEFAULT 'guest',
        Email                 NVARCHAR(200)    NULL,
        Name                  NVARCHAR(200)    NULL,
        GoogleId              NVARCHAR(200)    NULL,
        DeviceToken           NVARCHAR(500)    NULL,
        PreferredLanguage     NVARCHAR(10)     NULL,
        SubscriptionExpiresAt DATETIME2        NULL,
        LastLoginAt           DATETIME2        NULL,
        CONSTRAINT PK_Users PRIMARY KEY (Id)
    );
    CREATE UNIQUE INDEX UX_Users_Email    ON dbo.Users (Email)    WHERE Email IS NOT NULL    AND IsDeleted = 0;
    CREATE UNIQUE INDEX UX_Users_GoogleId ON dbo.Users (GoogleId) WHERE GoogleId IS NOT NULL AND IsDeleted = 0;
    CREATE INDEX IX_Users_DeviceToken ON dbo.Users (DeviceToken) WHERE DeviceToken IS NOT NULL;
END
GO
