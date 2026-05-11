IF OBJECT_ID('dbo.SummaryTemplates','U') IS NULL
BEGIN
    CREATE TABLE dbo.SummaryTemplates (
        Id                UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_SumTpl_Id DEFAULT NEWID(),
        CreatedAt         DATETIME2        NOT NULL CONSTRAINT DF_SumTpl_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt         DATETIME2        NULL,
        CreatedBy         UNIQUEIDENTIFIER NULL,
        UpdatedBy         UNIQUEIDENTIFIER NULL,
        IsDeleted         BIT              NOT NULL CONSTRAINT DF_SumTpl_IsDeleted DEFAULT 0,
        FormSetId         UNIQUEIDENTIFIER NOT NULL,
        SectionKey        NVARCHAR(100)    NOT NULL,
        SectionTitle      NVARCHAR(300)    NOT NULL,
        [Order]           INT              NOT NULL CONSTRAINT DF_SumTpl_Order DEFAULT 0,
        QuestionKeysJson  NVARCHAR(MAX)    NOT NULL,
        PromptHint        NVARCHAR(MAX)    NULL,
        CONSTRAINT PK_SummaryTemplates PRIMARY KEY (Id),
        CONSTRAINT FK_SumTpl_FormSets FOREIGN KEY (FormSetId) REFERENCES dbo.FormSets (Id)
    );
    CREATE UNIQUE INDEX UX_SumTpl_FormSet_Section ON dbo.SummaryTemplates (FormSetId, SectionKey) WHERE IsDeleted = 0;
END
GO
