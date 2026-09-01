-- Kind values match the frontend NotificationKind union:
-- 'daily-prompt' | 'story-featured' | 'story-loved' | 'family-shared'
IF OBJECT_ID('dbo.Notifications','U') IS NULL
BEGIN
    CREATE TABLE dbo.Notifications (
        Id        UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Notifications_Id DEFAULT NEWID(),
        CreatedAt DATETIME2        NOT NULL CONSTRAINT DF_Notifications_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2        NULL,
        CreatedBy UNIQUEIDENTIFIER NULL,
        UpdatedBy UNIQUEIDENTIFIER NULL,
        IsDeleted BIT              NOT NULL CONSTRAINT DF_Notifications_IsDeleted DEFAULT 0,
        UserId    UNIQUEIDENTIFIER NOT NULL,
        Kind      NVARCHAR(40)     NOT NULL,
        Title     NVARCHAR(200)    NOT NULL,
        Body      NVARCHAR(500)    NULL,
        LinkRoute NVARCHAR(200)    NULL,
        IsRead    BIT              NOT NULL CONSTRAINT DF_Notifications_IsRead DEFAULT 0,
        CONSTRAINT PK_Notifications PRIMARY KEY (Id),
        CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserId) REFERENCES dbo.Users (Id)
    );
    CREATE INDEX IX_Notifications_User ON dbo.Notifications (UserId, IsRead) WHERE IsDeleted = 0;
END
GO
