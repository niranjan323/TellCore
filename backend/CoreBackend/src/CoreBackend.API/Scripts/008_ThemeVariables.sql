IF OBJECT_ID('dbo.ThemeVariables','U') IS NULL
BEGIN
    CREATE TABLE dbo.ThemeVariables (
        Id         UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ThemeVars_Id DEFAULT NEWID(),
        CreatedAt  DATETIME2        NOT NULL CONSTRAINT DF_ThemeVars_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt  DATETIME2        NULL,
        CreatedBy  UNIQUEIDENTIFIER NULL,
        UpdatedBy  UNIQUEIDENTIFIER NULL,
        IsDeleted  BIT              NOT NULL CONSTRAINT DF_ThemeVars_IsDeleted DEFAULT 0,
        ThemeId    UNIQUEIDENTIFIER NOT NULL,
        [Key]      NVARCHAR(100)    NOT NULL,
        [Value]    NVARCHAR(500)    NOT NULL,
        CONSTRAINT PK_ThemeVariables PRIMARY KEY (Id),
        CONSTRAINT FK_ThemeVars_Themes FOREIGN KEY (ThemeId) REFERENCES dbo.Themes (Id)
    );
    CREATE UNIQUE INDEX UX_ThemeVars_Theme_Key ON dbo.ThemeVariables (ThemeId, [Key]) WHERE IsDeleted = 0;
END
GO
