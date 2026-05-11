IF OBJECT_ID('dbo.Products','U') IS NULL
BEGIN
    CREATE TABLE dbo.Products (
        Id               UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Products_Id DEFAULT NEWID(),
        CreatedAt        DATETIME2        NOT NULL CONSTRAINT DF_Products_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt        DATETIME2        NULL,
        CreatedBy        UNIQUEIDENTIFIER NULL,
        UpdatedBy        UNIQUEIDENTIFIER NULL,
        IsDeleted        BIT              NOT NULL CONSTRAINT DF_Products_IsDeleted DEFAULT 0,
        Slug             NVARCHAR(100)    NOT NULL,
        Name             NVARCHAR(200)    NOT NULL,
        Description      NVARCHAR(1000)   NULL,
        IsActive         BIT              NOT NULL CONSTRAINT DF_Products_IsActive DEFAULT 1,
        DefaultThemeId   UNIQUEIDENTIFIER NULL,
        DefaultFormSetId UNIQUEIDENTIFIER NULL,
        DefaultLanguage  NVARCHAR(10)     NOT NULL CONSTRAINT DF_Products_DefaultLanguage DEFAULT 'en',
        CONSTRAINT PK_Products PRIMARY KEY (Id),
        CONSTRAINT UQ_Products_Slug UNIQUE (Slug)
    );
END
GO
