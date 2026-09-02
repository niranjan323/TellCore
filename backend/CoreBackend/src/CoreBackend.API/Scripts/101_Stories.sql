IF OBJECT_ID('dbo.Stories','U') IS NULL
BEGIN
    CREATE TABLE dbo.Stories (
        Id               UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Stories_Id DEFAULT NEWID(),
        CreatedAt        DATETIME2        NOT NULL CONSTRAINT DF_Stories_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt        DATETIME2        NULL,
        CreatedBy        UNIQUEIDENTIFIER NULL,
        UpdatedBy        UNIQUEIDENTIFIER NULL,
        IsDeleted        BIT              NOT NULL CONSTRAINT DF_Stories_IsDeleted DEFAULT 0,
        UserId           UNIQUEIDENTIFIER NOT NULL,
        ProductId        UNIQUEIDENTIFIER NOT NULL,
        Title            NVARCHAR(300)    NULL,
        Kind             NVARCHAR(10)     NOT NULL CONSTRAINT DF_Stories_Kind DEFAULT 'text',            -- text | voice
        OriginalLanguage NVARCHAR(10)     NULL,                                                           -- detected by AI pipeline
        RawText          NVARCHAR(MAX)    NULL,                                                           -- as typed, or raw transcript
        ContentText      NVARCHAR(MAX)    NULL,                                                           -- cleaned text shown to readers
        Excerpt          NVARCHAR(500)    NULL,
        AudioUrl         NVARCHAR(500)    NULL,
        AudioPath        NVARCHAR(500)    NULL,                                                           -- storage-relative path (for pipeline reads)
        DurationSeconds  INT              NULL,
        WordCount        INT              NOT NULL CONSTRAINT DF_Stories_WordCount DEFAULT 0,
        Visibility       NVARCHAR(20)     NOT NULL CONSTRAINT DF_Stories_Visibility DEFAULT 'private',    -- private | family | community
        Status           NVARCHAR(20)     NOT NULL CONSTRAINT DF_Stories_Status DEFAULT 'draft',          -- draft | processing | published | flagged
        ModerationReason NVARCHAR(500)    NULL,
        PromptKey        NVARCHAR(100)    NULL,
        IsFeatured       BIT              NOT NULL CONSTRAINT DF_Stories_IsFeatured DEFAULT 0,
        HeartCount       INT              NOT NULL CONSTRAINT DF_Stories_HeartCount DEFAULT 0,
        ViewCount        INT              NOT NULL CONSTRAINT DF_Stories_ViewCount DEFAULT 0,
        PublishedAt      DATETIME2        NULL,
        CONSTRAINT PK_Stories PRIMARY KEY (Id),
        CONSTRAINT FK_Stories_Users    FOREIGN KEY (UserId)    REFERENCES dbo.Users (Id),
        CONSTRAINT FK_Stories_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products (Id)
    );
    CREATE INDEX IX_Stories_User ON dbo.Stories (UserId) WHERE IsDeleted = 0;
    CREATE INDEX IX_Stories_Community ON dbo.Stories (ProductId, Visibility, Status)
        INCLUDE (PublishedAt, ViewCount) WHERE IsDeleted = 0;
    CREATE INDEX IX_Stories_Status ON dbo.Stories (Status) WHERE IsDeleted = 0;
END
GO
