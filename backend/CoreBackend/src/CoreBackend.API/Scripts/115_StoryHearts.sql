-- One heart per user per story. Toggling off soft-deletes the row.
-- Stories.HeartCount is the denormalized counter kept in sync by the repository.
IF OBJECT_ID('dbo.StoryHearts','U') IS NULL
BEGIN
    CREATE TABLE dbo.StoryHearts (
        Id        UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_StoryHearts_Id DEFAULT NEWID(),
        CreatedAt DATETIME2        NOT NULL CONSTRAINT DF_StoryHearts_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2        NULL,
        CreatedBy UNIQUEIDENTIFIER NULL,
        UpdatedBy UNIQUEIDENTIFIER NULL,
        IsDeleted BIT              NOT NULL CONSTRAINT DF_StoryHearts_IsDeleted DEFAULT 0,
        StoryId   UNIQUEIDENTIFIER NOT NULL,
        UserId    UNIQUEIDENTIFIER NOT NULL,
        CONSTRAINT PK_StoryHearts PRIMARY KEY (Id),
        CONSTRAINT FK_StoryHearts_Stories FOREIGN KEY (StoryId) REFERENCES dbo.Stories (Id),
        CONSTRAINT FK_StoryHearts_Users   FOREIGN KEY (UserId)  REFERENCES dbo.Users (Id)
    );
    CREATE UNIQUE INDEX UX_StoryHearts_Story_User ON dbo.StoryHearts (StoryId, UserId) WHERE IsDeleted = 0;
END
GO
