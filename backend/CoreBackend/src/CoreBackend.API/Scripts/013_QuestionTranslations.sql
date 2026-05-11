IF OBJECT_ID('dbo.QuestionTranslations','U') IS NULL
BEGIN
    CREATE TABLE dbo.QuestionTranslations (
        Id            UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_QTrans_Id DEFAULT NEWID(),
        CreatedAt     DATETIME2        NOT NULL CONSTRAINT DF_QTrans_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt     DATETIME2        NULL,
        CreatedBy     UNIQUEIDENTIFIER NULL,
        UpdatedBy     UNIQUEIDENTIFIER NULL,
        IsDeleted     BIT              NOT NULL CONSTRAINT DF_QTrans_IsDeleted DEFAULT 0,
        QuestionId    UNIQUEIDENTIFIER NOT NULL,
        LanguageCode  NVARCHAR(10)     NOT NULL,
        Label         NVARCHAR(500)    NOT NULL,
        Placeholder   NVARCHAR(500)    NULL,
        HelpText      NVARCHAR(1000)   NULL,
        CONSTRAINT PK_QuestionTranslations PRIMARY KEY (Id),
        CONSTRAINT FK_QTrans_Questions FOREIGN KEY (QuestionId) REFERENCES dbo.Questions (Id)
    );
    CREATE UNIQUE INDEX UX_QTrans_Question_Lang ON dbo.QuestionTranslations (QuestionId, LanguageCode) WHERE IsDeleted = 0;
END
GO
