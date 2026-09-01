-- Share-link vault invites: owner generates a token URL, invitee opens it,
-- signs in, and accepts. Single-use, 7-day expiry (enforced in service layer).
IF OBJECT_ID('dbo.VaultInvites','U') IS NULL
BEGIN
    CREATE TABLE dbo.VaultInvites (
        Id           UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_VaultInvites_Id DEFAULT NEWID(),
        CreatedAt    DATETIME2        NOT NULL CONSTRAINT DF_VaultInvites_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt    DATETIME2        NULL,
        CreatedBy    UNIQUEIDENTIFIER NULL,
        UpdatedBy    UNIQUEIDENTIFIER NULL,
        IsDeleted    BIT              NOT NULL CONSTRAINT DF_VaultInvites_IsDeleted DEFAULT 0,
        OwnerUserId  UNIQUEIDENTIFIER NOT NULL,
        Token        NVARCHAR(100)    NOT NULL,
        DisplayName  NVARCHAR(200)    NULL,          -- who the invite is meant for (optional label)
        Relationship NVARCHAR(100)    NULL,
        ExpiresAt    DATETIME2        NOT NULL,
        UsedByUserId UNIQUEIDENTIFIER NULL,
        UsedAt       DATETIME2        NULL,
        CONSTRAINT PK_VaultInvites PRIMARY KEY (Id),
        CONSTRAINT FK_VaultInvites_Owner FOREIGN KEY (OwnerUserId) REFERENCES dbo.Users (Id),
        CONSTRAINT FK_VaultInvites_Used  FOREIGN KEY (UsedByUserId) REFERENCES dbo.Users (Id)
    );
    CREATE UNIQUE INDEX UX_VaultInvites_Token ON dbo.VaultInvites (Token) WHERE IsDeleted = 0;
    CREATE INDEX IX_VaultInvites_Owner ON dbo.VaultInvites (OwnerUserId) WHERE IsDeleted = 0;
END
GO
