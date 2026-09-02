IF OBJECT_ID('dbo.Streaks','U') IS NULL
BEGIN
    CREATE TABLE dbo.Streaks (
        Id            UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Streaks_Id DEFAULT NEWID(),
        CreatedAt     DATETIME2        NOT NULL CONSTRAINT DF_Streaks_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt     DATETIME2        NULL,
        CreatedBy     UNIQUEIDENTIFIER NULL,
        UpdatedBy     UNIQUEIDENTIFIER NULL,
        IsDeleted     BIT              NOT NULL CONSTRAINT DF_Streaks_IsDeleted DEFAULT 0,
        UserId        UNIQUEIDENTIFIER NOT NULL,
        CurrentStreak INT              NOT NULL CONSTRAINT DF_Streaks_CurrentStreak DEFAULT 0,
        LongestStreak INT              NOT NULL CONSTRAINT DF_Streaks_LongestStreak DEFAULT 0,
        LastEntryDate DATE             NULL,
        CONSTRAINT PK_Streaks PRIMARY KEY (Id),
        CONSTRAINT FK_Streaks_Users FOREIGN KEY (UserId) REFERENCES dbo.Users (Id)
    );
    CREATE UNIQUE INDEX UX_Streaks_User ON dbo.Streaks (UserId) WHERE IsDeleted = 0;
END
GO
