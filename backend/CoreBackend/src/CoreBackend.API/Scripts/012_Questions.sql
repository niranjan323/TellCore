IF OBJECT_ID('dbo.Questions','U') IS NULL
BEGIN
    CREATE TABLE dbo.Questions (
        Id          UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Questions_Id DEFAULT NEWID(),
        CreatedAt   DATETIME2        NOT NULL CONSTRAINT DF_Questions_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt   DATETIME2        NULL,
        CreatedBy   UNIQUEIDENTIFIER NULL,
        UpdatedBy   UNIQUEIDENTIFIER NULL,
        IsDeleted   BIT              NOT NULL CONSTRAINT DF_Questions_IsDeleted DEFAULT 0,
        FormSetId   UNIQUEIDENTIFIER NOT NULL,
        [Key]       NVARCHAR(100)    NOT NULL,
        [Type]      NVARCHAR(50)     NOT NULL,
        [Order]     INT              NOT NULL CONSTRAINT DF_Questions_Order DEFAULT 0,
        IsRequired  BIT              NOT NULL CONSTRAINT DF_Questions_IsRequired DEFAULT 0,
        [Group]     NVARCHAR(100)    NULL,
        ConfigJson  NVARCHAR(MAX)    NULL,
        CONSTRAINT PK_Questions PRIMARY KEY (Id),
        CONSTRAINT FK_Questions_FormSets FOREIGN KEY (FormSetId) REFERENCES dbo.FormSets (Id)
    );
    CREATE UNIQUE INDEX UX_Questions_FormSet_Key ON dbo.Questions (FormSetId, [Key]) WHERE IsDeleted = 0;
END
GO
