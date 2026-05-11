IF OBJECT_ID('dbo.Answers','U') IS NULL
BEGIN
    CREATE TABLE dbo.Answers (
        Id           UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Answers_Id DEFAULT NEWID(),
        CreatedAt    DATETIME2        NOT NULL CONSTRAINT DF_Answers_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt    DATETIME2        NULL,
        CreatedBy    UNIQUEIDENTIFIER NULL,
        UpdatedBy    UNIQUEIDENTIFIER NULL,
        IsDeleted    BIT              NOT NULL CONSTRAINT DF_Answers_IsDeleted DEFAULT 0,
        SessionId    UNIQUEIDENTIFIER NOT NULL,
        QuestionId   UNIQUEIDENTIFIER NOT NULL,
        QuestionKey  NVARCHAR(100)    NOT NULL,
        ValueJson    NVARCHAR(MAX)    NOT NULL,
        CONSTRAINT PK_Answers PRIMARY KEY (Id),
        CONSTRAINT FK_Answers_Sessions  FOREIGN KEY (SessionId)  REFERENCES dbo.Sessions (Id),
        CONSTRAINT FK_Answers_Questions FOREIGN KEY (QuestionId) REFERENCES dbo.Questions (Id)
    );
    CREATE INDEX IX_Answers_Session ON dbo.Answers (SessionId);
END
GO
