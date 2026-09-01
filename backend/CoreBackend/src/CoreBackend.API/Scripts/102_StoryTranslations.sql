IF OBJECT_ID('dbo.StoryTranslations','U') IS NULL
BEGIN
    CREATE TABLE dbo.StoryTranslations (
        Id            UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_StoryTranslations_Id DEFAULT NEWID(),
        CreatedAt     DATETIME2        NOT NULL CONSTRAINT DF_StoryTranslations_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt     DATETIME2        NULL,
        CreatedBy     UNIQUEIDENTIFIER NULL,
        UpdatedBy     UNIQUEIDENTIFIER NULL,
        IsDeleted     BIT              NOT NULL CONSTRAINT DF_StoryTranslations_IsDeleted DEFAULT 0,
        StoryId       UNIQUEIDENTIFIER NOT NULL,
        LanguageCode  NVARCHAR(10)     NOT NULL,
        Title         NVARCHAR(300)    NULL,
        ContentText   NVARCHAR(MAX)    NOT NULL,
        Excerpt       NVARCHAR(500)    NULL,
        IsAiGenerated BIT              NOT NULL CONSTRAINT DF_StoryTranslations_IsAiGenerated DEFAULT 1,
        CONSTRAINT PK_StoryTranslations PRIMARY KEY (Id),
        CONSTRAINT FK_StoryTranslations_Stories FOREIGN KEY (StoryId) REFERENCES dbo.Stories (Id)
    );
    CREATE UNIQUE INDEX UX_StoryTranslations_Story_Lang
        ON dbo.StoryTranslations (StoryId, LanguageCode) WHERE IsDeleted = 0;
END
GO
