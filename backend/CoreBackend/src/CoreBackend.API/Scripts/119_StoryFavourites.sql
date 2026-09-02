-- Saved/bookmarked stories ("favourites") — like hearts, but a private shelf.
IF OBJECT_ID('dbo.StoryFavourites','U') IS NULL
BEGIN
    CREATE TABLE dbo.StoryFavourites (
        Id        UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_StoryFavourites_Id DEFAULT NEWID(),
        CreatedAt DATETIME2        NOT NULL CONSTRAINT DF_StoryFavourites_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2        NULL,
        CreatedBy UNIQUEIDENTIFIER NULL,
        UpdatedBy UNIQUEIDENTIFIER NULL,
        IsDeleted BIT              NOT NULL CONSTRAINT DF_StoryFavourites_IsDeleted DEFAULT 0,
        StoryId   UNIQUEIDENTIFIER NOT NULL,
        UserId    UNIQUEIDENTIFIER NOT NULL,
        CONSTRAINT PK_StoryFavourites PRIMARY KEY (Id),
        CONSTRAINT FK_StoryFavourites_Stories FOREIGN KEY (StoryId) REFERENCES dbo.Stories (Id),
        CONSTRAINT FK_StoryFavourites_Users   FOREIGN KEY (UserId)  REFERENCES dbo.Users (Id)
    );
    CREATE UNIQUE INDEX UX_StoryFavourites_Story_User ON dbo.StoryFavourites (StoryId, UserId) WHERE IsDeleted = 0;
    CREATE INDEX IX_StoryFavourites_User ON dbo.StoryFavourites (UserId) WHERE IsDeleted = 0;
END
GO
