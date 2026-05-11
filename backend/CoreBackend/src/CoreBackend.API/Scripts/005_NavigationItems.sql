IF OBJECT_ID('dbo.NavigationItems','U') IS NULL
BEGIN
    CREATE TABLE dbo.NavigationItems (
        Id            UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_NavigationItems_Id DEFAULT NEWID(),
        CreatedAt     DATETIME2        NOT NULL CONSTRAINT DF_NavigationItems_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt     DATETIME2        NULL,
        CreatedBy     UNIQUEIDENTIFIER NULL,
        UpdatedBy     UNIQUEIDENTIFIER NULL,
        IsDeleted     BIT              NOT NULL CONSTRAINT DF_NavigationItems_IsDeleted DEFAULT 0,
        ProductId     UNIQUEIDENTIFIER NOT NULL,
        [Key]         NVARCHAR(100)    NOT NULL,
        Route         NVARCHAR(200)    NOT NULL,
        Icon          NVARCHAR(100)    NULL,
        [Order]       INT              NOT NULL CONSTRAINT DF_NavigationItems_Order DEFAULT 0,
        RequiredRole  NVARCHAR(20)     NOT NULL CONSTRAINT DF_NavigationItems_RequiredRole DEFAULT 'guest',
        IsVisible     BIT              NOT NULL CONSTRAINT DF_NavigationItems_IsVisible DEFAULT 1,
        CONSTRAINT PK_NavigationItems PRIMARY KEY (Id),
        CONSTRAINT FK_NavigationItems_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products (Id)
    );
    CREATE INDEX IX_NavigationItems_Product ON dbo.NavigationItems (ProductId);
END
GO
