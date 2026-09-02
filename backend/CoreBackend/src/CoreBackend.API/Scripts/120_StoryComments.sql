-- Comments on stories. Soft-delete only; deletable by the comment author or
-- the story's owner.
IF OBJECT_ID('dbo.StoryComments','U') IS NULL
BEGIN
    CREATE TABLE dbo.StoryComments (
        Id        UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_StoryComments_Id DEFAULT NEWID(),
        CreatedAt DATETIME2        NOT NULL CONSTRAINT DF_StoryComments_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2        NULL,
        CreatedBy UNIQUEIDENTIFIER NULL,
        UpdatedBy UNIQUEIDENTIFIER NULL,
        IsDeleted BIT              NOT NULL CONSTRAINT DF_StoryComments_IsDeleted DEFAULT 0,
        StoryId   UNIQUEIDENTIFIER NOT NULL,
        UserId    UNIQUEIDENTIFIER NOT NULL,
        Body      NVARCHAR(1000)   NOT NULL,
        CONSTRAINT PK_StoryComments PRIMARY KEY (Id),
        CONSTRAINT FK_StoryComments_Stories FOREIGN KEY (StoryId) REFERENCES dbo.Stories (Id),
        CONSTRAINT FK_StoryComments_Users   FOREIGN KEY (UserId)  REFERENCES dbo.Users (Id)
    );
    CREATE INDEX IX_StoryComments_Story ON dbo.StoryComments (StoryId, CreatedAt) WHERE IsDeleted = 0;
END
GO
