IF OBJECT_ID('dbo.QuestionOptions','U') IS NULL
BEGIN
    CREATE TABLE dbo.QuestionOptions (
        Id          UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_QOpts_Id DEFAULT NEWID(),
        CreatedAt   DATETIME2        NOT NULL CONSTRAINT DF_QOpts_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt   DATETIME2        NULL,
        CreatedBy   UNIQUEIDENTIFIER NULL,
        UpdatedBy   UNIQUEIDENTIFIER NULL,
        IsDeleted   BIT              NOT NULL CONSTRAINT DF_QOpts_IsDeleted DEFAULT 0,
        QuestionId  UNIQUEIDENTIFIER NOT NULL,
        [Value]     NVARCHAR(200)    NOT NULL,
        [Order]     INT              NOT NULL CONSTRAINT DF_QOpts_Order DEFAULT 0,
        CONSTRAINT PK_QuestionOptions PRIMARY KEY (Id),
        CONSTRAINT FK_QOpts_Questions FOREIGN KEY (QuestionId) REFERENCES dbo.Questions (Id)
    );
    CREATE UNIQUE INDEX UX_QOpts_Question_Value ON dbo.QuestionOptions (QuestionId, [Value]) WHERE IsDeleted = 0;
END
GO
