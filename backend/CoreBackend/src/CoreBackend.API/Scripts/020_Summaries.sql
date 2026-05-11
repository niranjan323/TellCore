IF OBJECT_ID('dbo.Summaries','U') IS NULL
BEGIN
    CREATE TABLE dbo.Summaries (
        Id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Summaries_Id DEFAULT NEWID(),
        CreatedAt       DATETIME2        NOT NULL CONSTRAINT DF_Summaries_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt       DATETIME2        NULL,
        CreatedBy       UNIQUEIDENTIFIER NULL,
        UpdatedBy       UNIQUEIDENTIFIER NULL,
        IsDeleted       BIT              NOT NULL CONSTRAINT DF_Summaries_IsDeleted DEFAULT 0,
        SessionId       UNIQUEIDENTIFIER NOT NULL,
        LanguageCode    NVARCHAR(10)     NOT NULL CONSTRAINT DF_Summaries_LanguageCode DEFAULT 'en',
        Title           NVARCHAR(500)    NOT NULL,
        Subtitle        NVARCHAR(1000)   NULL,
        Disclaimer      NVARCHAR(1000)   NULL,
        SectionsJson    NVARCHAR(MAX)    NOT NULL,
        IsAiGenerated   BIT              NOT NULL CONSTRAINT DF_Summaries_IsAiGenerated DEFAULT 0,
        AiProvider      NVARCHAR(50)     NULL,
        AiModel         NVARCHAR(100)    NULL,
        GeneratedAt     DATETIME2        NOT NULL CONSTRAINT DF_Summaries_GeneratedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_Summaries PRIMARY KEY (Id),
        CONSTRAINT FK_Summaries_Sessions FOREIGN KEY (SessionId) REFERENCES dbo.Sessions (Id)
    );
    CREATE INDEX IX_Summaries_Session ON dbo.Summaries (SessionId);
END
GO
