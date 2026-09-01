-- A row = one person in the owner's family vault.
-- MemberUserId stays NULL until the invitee accepts a vault invite link.
IF OBJECT_ID('dbo.FamilyMembers','U') IS NULL
BEGIN
    CREATE TABLE dbo.FamilyMembers (
        Id           UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_FamilyMembers_Id DEFAULT NEWID(),
        CreatedAt    DATETIME2        NOT NULL CONSTRAINT DF_FamilyMembers_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt    DATETIME2        NULL,
        CreatedBy    UNIQUEIDENTIFIER NULL,
        UpdatedBy    UNIQUEIDENTIFIER NULL,
        IsDeleted    BIT              NOT NULL CONSTRAINT DF_FamilyMembers_IsDeleted DEFAULT 0,
        OwnerUserId  UNIQUEIDENTIFIER NOT NULL,
        MemberUserId UNIQUEIDENTIFIER NULL,
        DisplayName  NVARCHAR(200)    NOT NULL,
        Relationship NVARCHAR(100)    NULL,
        Status       NVARCHAR(20)     NOT NULL CONSTRAINT DF_FamilyMembers_Status DEFAULT 'invited',  -- invited | active
        CONSTRAINT PK_FamilyMembers PRIMARY KEY (Id),
        CONSTRAINT FK_FamilyMembers_Owner  FOREIGN KEY (OwnerUserId)  REFERENCES dbo.Users (Id),
        CONSTRAINT FK_FamilyMembers_Member FOREIGN KEY (MemberUserId) REFERENCES dbo.Users (Id)
    );
    CREATE INDEX IX_FamilyMembers_Owner  ON dbo.FamilyMembers (OwnerUserId)  WHERE IsDeleted = 0;
    CREATE INDEX IX_FamilyMembers_Member ON dbo.FamilyMembers (MemberUserId) WHERE MemberUserId IS NOT NULL AND IsDeleted = 0;
    CREATE UNIQUE INDEX UX_FamilyMembers_Owner_Member
        ON dbo.FamilyMembers (OwnerUserId, MemberUserId) WHERE MemberUserId IS NOT NULL AND IsDeleted = 0;
END
GO
