-- View event log. CreatedAt is the view timestamp; Stories.ViewCount is the
-- denormalized counter incremented alongside each insert.
IF OBJECT_ID('dbo.StoryViews','U') IS NULL
BEGIN
    CREATE TABLE dbo.StoryViews (
        Id           UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_StoryViews_Id DEFAULT NEWID(),
        CreatedAt    DATETIME2        NOT NULL CONSTRAINT DF_StoryViews_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt    DATETIME2        NULL,
        CreatedBy    UNIQUEIDENTIFIER NULL,
        UpdatedBy    UNIQUEIDENTIFIER NULL,
        IsDeleted    BIT              NOT NULL CONSTRAINT DF_StoryViews_IsDeleted DEFAULT 0,
        StoryId      UNIQUEIDENTIFIER NOT NULL,
        ViewerUserId UNIQUEIDENTIFIER NULL,          -- NULL = anonymous/guest without token
        CONSTRAINT PK_StoryViews PRIMARY KEY (Id),
        CONSTRAINT FK_StoryViews_Stories FOREIGN KEY (StoryId) REFERENCES dbo.Stories (Id)
    );
    CREATE INDEX IX_StoryViews_Story ON dbo.StoryViews (StoryId, CreatedAt);
END
GO
