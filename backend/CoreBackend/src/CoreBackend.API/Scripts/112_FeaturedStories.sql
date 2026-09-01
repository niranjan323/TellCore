-- One story-of-the-day row per product per date. Manual picks (IsManualPick=1)
-- win over the algorithmic pick (most-viewed community story of the prior day).
IF OBJECT_ID('dbo.FeaturedStories','U') IS NULL
BEGIN
    CREATE TABLE dbo.FeaturedStories (
        Id           UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_FeaturedStories_Id DEFAULT NEWID(),
        CreatedAt    DATETIME2        NOT NULL CONSTRAINT DF_FeaturedStories_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt    DATETIME2        NULL,
        CreatedBy    UNIQUEIDENTIFIER NULL,
        UpdatedBy    UNIQUEIDENTIFIER NULL,
        IsDeleted    BIT              NOT NULL CONSTRAINT DF_FeaturedStories_IsDeleted DEFAULT 0,
        ProductId    UNIQUEIDENTIFIER NOT NULL,
        StoryId      UNIQUEIDENTIFIER NOT NULL,
        FeaturedOn   DATE             NOT NULL,
        IsManualPick BIT              NOT NULL CONSTRAINT DF_FeaturedStories_IsManualPick DEFAULT 0,
        CONSTRAINT PK_FeaturedStories PRIMARY KEY (Id),
        CONSTRAINT FK_FeaturedStories_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products (Id),
        CONSTRAINT FK_FeaturedStories_Stories  FOREIGN KEY (StoryId)   REFERENCES dbo.Stories (Id)
    );
    CREATE UNIQUE INDEX UX_FeaturedStories_Product_Date
        ON dbo.FeaturedStories (ProductId, FeaturedOn) WHERE IsDeleted = 0;
END
GO
