IF OBJECT_ID('dbo.QuestionOptionTranslations','U') IS NULL
BEGIN
    CREATE TABLE dbo.QuestionOptionTranslations (
        Id                UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_QOptTrans_Id DEFAULT NEWID(),
        CreatedAt         DATETIME2        NOT NULL CONSTRAINT DF_QOptTrans_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt         DATETIME2        NULL,
        CreatedBy         UNIQUEIDENTIFIER NULL,
        UpdatedBy         UNIQUEIDENTIFIER NULL,
        IsDeleted         BIT              NOT NULL CONSTRAINT DF_QOptTrans_IsDeleted DEFAULT 0,
        QuestionOptionId  UNIQUEIDENTIFIER NOT NULL,
        LanguageCode      NVARCHAR(10)     NOT NULL,
        Label             NVARCHAR(300)    NOT NULL,
        CONSTRAINT PK_QuestionOptionTranslations PRIMARY KEY (Id),
        CONSTRAINT FK_QOptTrans_QOpts FOREIGN KEY (QuestionOptionId) REFERENCES dbo.QuestionOptions (Id)
    );
    CREATE UNIQUE INDEX UX_QOptTrans_Opt_Lang ON dbo.QuestionOptionTranslations (QuestionOptionId, LanguageCode) WHERE IsDeleted = 0;
END
GO
