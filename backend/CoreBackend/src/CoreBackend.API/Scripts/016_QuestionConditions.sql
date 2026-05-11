IF OBJECT_ID('dbo.QuestionConditions','U') IS NULL
BEGIN
    CREATE TABLE dbo.QuestionConditions (
        Id            UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_QCond_Id DEFAULT NEWID(),
        CreatedAt     DATETIME2        NOT NULL CONSTRAINT DF_QCond_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt     DATETIME2        NULL,
        CreatedBy     UNIQUEIDENTIFIER NULL,
        UpdatedBy     UNIQUEIDENTIFIER NULL,
        IsDeleted     BIT              NOT NULL CONSTRAINT DF_QCond_IsDeleted DEFAULT 0,
        QuestionId    UNIQUEIDENTIFIER NOT NULL,
        DependsOnKey  NVARCHAR(100)    NOT NULL,
        [Operator]    NVARCHAR(50)     NOT NULL,
        ValuesJson    NVARCHAR(MAX)    NOT NULL,
        CONSTRAINT PK_QuestionConditions PRIMARY KEY (Id),
        CONSTRAINT FK_QCond_Questions FOREIGN KEY (QuestionId) REFERENCES dbo.Questions (Id)
    );
    CREATE INDEX IX_QCond_Question ON dbo.QuestionConditions (QuestionId);
END
GO
