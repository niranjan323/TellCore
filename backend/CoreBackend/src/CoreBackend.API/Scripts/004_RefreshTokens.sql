IF OBJECT_ID('dbo.RefreshTokens','U') IS NULL
BEGIN
    CREATE TABLE dbo.RefreshTokens (
        Id                UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_RefreshTokens_Id DEFAULT NEWID(),
        CreatedAt         DATETIME2        NOT NULL CONSTRAINT DF_RefreshTokens_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt         DATETIME2        NULL,
        CreatedBy         UNIQUEIDENTIFIER NULL,
        UpdatedBy         UNIQUEIDENTIFIER NULL,
        IsDeleted         BIT              NOT NULL CONSTRAINT DF_RefreshTokens_IsDeleted DEFAULT 0,
        UserId            UNIQUEIDENTIFIER NOT NULL,
        Token             NVARCHAR(500)    NOT NULL,
        ExpiresAt         DATETIME2        NOT NULL,
        RevokedAt         DATETIME2        NULL,
        ReplacedByToken   NVARCHAR(500)    NULL,
        CONSTRAINT PK_RefreshTokens PRIMARY KEY (Id),
        CONSTRAINT FK_RefreshTokens_Users FOREIGN KEY (UserId) REFERENCES dbo.Users (Id)
    );
    CREATE UNIQUE INDEX UX_RefreshTokens_Token ON dbo.RefreshTokens (Token);
    CREATE INDEX IX_RefreshTokens_UserId ON dbo.RefreshTokens (UserId);
END
GO
