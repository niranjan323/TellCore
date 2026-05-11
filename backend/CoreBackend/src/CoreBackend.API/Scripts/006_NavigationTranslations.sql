IF OBJECT_ID('dbo.NavigationTranslations','U') IS NULL
BEGIN
    CREATE TABLE dbo.NavigationTranslations (
        Id               UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_NavTrans_Id DEFAULT NEWID(),
        CreatedAt        DATETIME2        NOT NULL CONSTRAINT DF_NavTrans_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt        DATETIME2        NULL,
        CreatedBy        UNIQUEIDENTIFIER NULL,
        UpdatedBy        UNIQUEIDENTIFIER NULL,
        IsDeleted        BIT              NOT NULL CONSTRAINT DF_NavTrans_IsDeleted DEFAULT 0,
        NavigationItemId UNIQUEIDENTIFIER NOT NULL,
        LanguageCode     NVARCHAR(10)     NOT NULL,
        Label            NVARCHAR(200)    NOT NULL,
        CONSTRAINT PK_NavigationTranslations PRIMARY KEY (Id),
        CONSTRAINT FK_NavTrans_NavigationItems FOREIGN KEY (NavigationItemId) REFERENCES dbo.NavigationItems (Id)
    );
    CREATE UNIQUE INDEX UX_NavTrans_Item_Lang ON dbo.NavigationTranslations (NavigationItemId, LanguageCode) WHERE IsDeleted = 0;
END
GO
