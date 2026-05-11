IF OBJECT_ID('dbo.AuditLogs','U') IS NULL
BEGIN
    CREATE TABLE dbo.AuditLogs (
        Id          UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_AuditLogs_Id DEFAULT NEWID(),
        CreatedAt   DATETIME2        NOT NULL CONSTRAINT DF_AuditLogs_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt   DATETIME2        NULL,
        CreatedBy   UNIQUEIDENTIFIER NULL,
        UpdatedBy   UNIQUEIDENTIFIER NULL,
        IsDeleted   BIT              NOT NULL CONSTRAINT DF_AuditLogs_IsDeleted DEFAULT 0,
        UserId      UNIQUEIDENTIFIER NULL,
        EntityName  NVARCHAR(100)    NOT NULL,
        EntityId    UNIQUEIDENTIFIER NULL,
        Action      NVARCHAR(50)     NOT NULL,
        PayloadJson NVARCHAR(MAX)    NULL,
        IpAddress   NVARCHAR(64)     NULL,
        CONSTRAINT PK_AuditLogs PRIMARY KEY (Id)
    );
    CREATE INDEX IX_AuditLogs_Entity ON dbo.AuditLogs (EntityName, EntityId);
END
GO
