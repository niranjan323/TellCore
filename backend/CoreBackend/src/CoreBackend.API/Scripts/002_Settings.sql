IF OBJECT_ID('dbo.Settings','U') IS NULL
BEGIN
    CREATE TABLE dbo.Settings (
        Id          UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Settings_Id DEFAULT NEWID(),
        CreatedAt   DATETIME2        NOT NULL CONSTRAINT DF_Settings_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt   DATETIME2        NULL,
        CreatedBy   UNIQUEIDENTIFIER NULL,
        UpdatedBy   UNIQUEIDENTIFIER NULL,
        IsDeleted   BIT              NOT NULL CONSTRAINT DF_Settings_IsDeleted DEFAULT 0,
        ProductId   UNIQUEIDENTIFIER NULL,
        [Key]       NVARCHAR(200)    NOT NULL,
        [Value]     NVARCHAR(MAX)    NOT NULL,
        DataType    NVARCHAR(50)     NOT NULL,
        Description NVARCHAR(500)    NULL,
        IsSecret    BIT              NOT NULL CONSTRAINT DF_Settings_IsSecret DEFAULT 0,
        CONSTRAINT PK_Settings PRIMARY KEY (Id)
    );
    CREATE UNIQUE INDEX UX_Settings_Product_Key ON dbo.Settings (ProductId, [Key]) WHERE IsDeleted = 0;
END
GO
