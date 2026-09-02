-- Reader reports on stories (required by app-store UGC policies).
-- One report per user per story; at stories.reports.autohide distinct reports
-- a published story is auto-unpublished pending review.
IF OBJECT_ID('dbo.StoryReports','U') IS NULL
BEGIN
    CREATE TABLE dbo.StoryReports (
        Id             UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_StoryReports_Id DEFAULT NEWID(),
        CreatedAt      DATETIME2        NOT NULL CONSTRAINT DF_StoryReports_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt      DATETIME2        NULL,
        CreatedBy      UNIQUEIDENTIFIER NULL,
        UpdatedBy      UNIQUEIDENTIFIER NULL,
        IsDeleted      BIT              NOT NULL CONSTRAINT DF_StoryReports_IsDeleted DEFAULT 0,
        StoryId        UNIQUEIDENTIFIER NOT NULL,
        ReporterUserId UNIQUEIDENTIFIER NOT NULL,
        Reason         NVARCHAR(50)     NOT NULL,          -- harmful | spam | private-info | plagiarism | other
        Details        NVARCHAR(500)    NULL,
        Status         NVARCHAR(20)     NOT NULL CONSTRAINT DF_StoryReports_Status DEFAULT 'open',  -- open | reviewed | dismissed
        CONSTRAINT PK_StoryReports PRIMARY KEY (Id),
        CONSTRAINT FK_StoryReports_Stories FOREIGN KEY (StoryId) REFERENCES dbo.Stories (Id),
        CONSTRAINT FK_StoryReports_Users   FOREIGN KEY (ReporterUserId) REFERENCES dbo.Users (Id)
    );
    CREATE UNIQUE INDEX UX_StoryReports_Story_Reporter
        ON dbo.StoryReports (StoryId, ReporterUserId) WHERE IsDeleted = 0;
    CREATE INDEX IX_StoryReports_Status ON dbo.StoryReports (Status) WHERE IsDeleted = 0;
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Settings WHERE [Key] = 'stories.reports.autohide')
    INSERT INTO dbo.Settings ([Key],[Value],DataType,IsSecret,Description)
    VALUES ('stories.reports.autohide','3','int',0,'Distinct reports that auto-unpublish a story pending review');
GO
