IF OBJECT_ID('dbo.Themes','U') IS NULL
BEGIN
    CREATE TABLE dbo.Themes (
        Id         UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Themes_Id DEFAULT NEWID(),
        CreatedAt  DATETIME2        NOT NULL CONSTRAINT DF_Themes_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt  DATETIME2        NULL,
        CreatedBy  UNIQUEIDENTIFIER NULL,
        UpdatedBy  UNIQUEIDENTIFIER NULL,
        IsDeleted  BIT              NOT NULL CONSTRAINT DF_Themes_IsDeleted DEFAULT 0,
        ProductId  UNIQUEIDENTIFIER NOT NULL,
        Slug       NVARCHAR(100)    NOT NULL,
        Name       NVARCHAR(200)    NOT NULL,
        IsActive   BIT              NOT NULL CONSTRAINT DF_Themes_IsActive DEFAULT 1,
        IsDefault  BIT              NOT NULL CONSTRAINT DF_Themes_IsDefault DEFAULT 0,
        CONSTRAINT PK_Themes PRIMARY KEY (Id),
        CONSTRAINT FK_Themes_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products (Id)
    );
    CREATE UNIQUE INDEX UX_Themes_Product_Slug ON dbo.Themes (ProductId, Slug) WHERE IsDeleted = 0;
END
GO
