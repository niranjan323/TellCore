IF OBJECT_ID('dbo.FormSets','U') IS NULL
BEGIN
    CREATE TABLE dbo.FormSets (
        Id          UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_FormSets_Id DEFAULT NEWID(),
        CreatedAt   DATETIME2        NOT NULL CONSTRAINT DF_FormSets_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt   DATETIME2        NULL,
        CreatedBy   UNIQUEIDENTIFIER NULL,
        UpdatedBy   UNIQUEIDENTIFIER NULL,
        IsDeleted   BIT              NOT NULL CONSTRAINT DF_FormSets_IsDeleted DEFAULT 0,
        ProductId   UNIQUEIDENTIFIER NOT NULL,
        Slug        NVARCHAR(100)    NOT NULL,
        Name        NVARCHAR(200)    NOT NULL,
        Description NVARCHAR(1000)   NULL,
        IsDefault   BIT              NOT NULL CONSTRAINT DF_FormSets_IsDefault DEFAULT 0,
        IsActive    BIT              NOT NULL CONSTRAINT DF_FormSets_IsActive DEFAULT 1,
        CONSTRAINT PK_FormSets PRIMARY KEY (Id),
        CONSTRAINT FK_FormSets_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products (Id)
    );
    CREATE UNIQUE INDEX UX_FormSets_Product_Slug ON dbo.FormSets (ProductId, Slug) WHERE IsDeleted = 0;
END
GO
