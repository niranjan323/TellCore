IF OBJECT_ID('dbo.StoryTags','U') IS NULL
BEGIN
    CREATE TABLE dbo.StoryTags (
        Id        UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_StoryTags_Id DEFAULT NEWID(),
        CreatedAt DATETIME2        NOT NULL CONSTRAINT DF_StoryTags_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2        NULL,
        CreatedBy UNIQUEIDENTIFIER NULL,
        UpdatedBy UNIQUEIDENTIFIER NULL,
        IsDeleted BIT              NOT NULL CONSTRAINT DF_StoryTags_IsDeleted DEFAULT 0,
        StoryId   UNIQUEIDENTIFIER NOT NULL,
        Tag       NVARCHAR(50)     NOT NULL,
        CONSTRAINT PK_StoryTags PRIMARY KEY (Id),
        CONSTRAINT FK_StoryTags_Stories FOREIGN KEY (StoryId) REFERENCES dbo.Stories (Id)
    );
    CREATE UNIQUE INDEX UX_StoryTags_Story_Tag ON dbo.StoryTags (StoryId, Tag) WHERE IsDeleted = 0;
    CREATE INDEX IX_StoryTags_Tag ON dbo.StoryTags (Tag) WHERE IsDeleted = 0;
END
GO
