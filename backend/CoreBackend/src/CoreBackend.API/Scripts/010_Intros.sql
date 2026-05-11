IF OBJECT_ID('dbo.Intros','U') IS NULL
BEGIN
    CREATE TABLE dbo.Intros (
        Id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Intros_Id DEFAULT NEWID(),
        CreatedAt           DATETIME2        NOT NULL CONSTRAINT DF_Intros_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt           DATETIME2        NULL,
        CreatedBy           UNIQUEIDENTIFIER NULL,
        UpdatedBy           UNIQUEIDENTIFIER NULL,
        IsDeleted           BIT              NOT NULL CONSTRAINT DF_Intros_IsDeleted DEFAULT 0,
        FormSetId           UNIQUEIDENTIFIER NOT NULL,
        IconKey             NVARCHAR(100)    NULL,
        PrimaryButtonRoute  NVARCHAR(200)    NULL,
        VoiceNoteEnabled    BIT              NOT NULL CONSTRAINT DF_Intros_VoiceNoteEnabled DEFAULT 0,
        CONSTRAINT PK_Intros PRIMARY KEY (Id),
        CONSTRAINT FK_Intros_FormSets FOREIGN KEY (FormSetId) REFERENCES dbo.FormSets (Id)
    );
    CREATE UNIQUE INDEX UX_Intros_FormSet ON dbo.Intros (FormSetId) WHERE IsDeleted = 0;
END
GO
