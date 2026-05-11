IF OBJECT_ID('dbo.Sessions','U') IS NULL
BEGIN
    CREATE TABLE dbo.Sessions (
        Id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Sessions_Id DEFAULT NEWID(),
        CreatedAt       DATETIME2        NOT NULL CONSTRAINT DF_Sessions_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt       DATETIME2        NULL,
        CreatedBy       UNIQUEIDENTIFIER NULL,
        UpdatedBy       UNIQUEIDENTIFIER NULL,
        IsDeleted       BIT              NOT NULL CONSTRAINT DF_Sessions_IsDeleted DEFAULT 0,
        UserId          UNIQUEIDENTIFIER NOT NULL,
        ProductId       UNIQUEIDENTIFIER NOT NULL,
        FormSetId       UNIQUEIDENTIFIER NOT NULL,
        LanguageCode    NVARCHAR(10)     NOT NULL CONSTRAINT DF_Sessions_LanguageCode DEFAULT 'en',
        Status          NVARCHAR(30)     NOT NULL CONSTRAINT DF_Sessions_Status DEFAULT 'in_progress',
        VoiceNoteUrl    NVARCHAR(500)    NULL,
        VoiceTranscript NVARCHAR(MAX)    NULL,
        CompletedAt     DATETIME2        NULL,
        CONSTRAINT PK_Sessions PRIMARY KEY (Id),
        CONSTRAINT FK_Sessions_Users    FOREIGN KEY (UserId)    REFERENCES dbo.Users (Id),
        CONSTRAINT FK_Sessions_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products (Id),
        CONSTRAINT FK_Sessions_FormSets FOREIGN KEY (FormSetId) REFERENCES dbo.FormSets (Id)
    );
    CREATE INDEX IX_Sessions_User    ON dbo.Sessions (UserId);
    CREATE INDEX IX_Sessions_Product ON dbo.Sessions (ProductId);
END
GO
