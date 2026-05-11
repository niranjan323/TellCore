IF OBJECT_ID('dbo.IntroTranslations','U') IS NULL
BEGIN
    CREATE TABLE dbo.IntroTranslations (
        Id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_IntroTrans_Id DEFAULT NEWID(),
        CreatedAt           DATETIME2        NOT NULL CONSTRAINT DF_IntroTrans_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt           DATETIME2        NULL,
        CreatedBy           UNIQUEIDENTIFIER NULL,
        UpdatedBy           UNIQUEIDENTIFIER NULL,
        IsDeleted           BIT              NOT NULL CONSTRAINT DF_IntroTrans_IsDeleted DEFAULT 0,
        IntroId             UNIQUEIDENTIFIER NOT NULL,
        LanguageCode        NVARCHAR(10)     NOT NULL,
        Title               NVARCHAR(300)    NOT NULL,
        Subtitle            NVARCHAR(500)    NULL,
        Body                NVARCHAR(MAX)    NULL,
        AudioUrl            NVARCHAR(500)    NULL,
        PrimaryButtonLabel  NVARCHAR(200)    NULL,
        CONSTRAINT PK_IntroTranslations PRIMARY KEY (Id),
        CONSTRAINT FK_IntroTrans_Intros FOREIGN KEY (IntroId) REFERENCES dbo.Intros (Id)
    );
    CREATE UNIQUE INDEX UX_IntroTrans_Intro_Lang ON dbo.IntroTranslations (IntroId, LanguageCode) WHERE IsDeleted = 0;
END
GO
