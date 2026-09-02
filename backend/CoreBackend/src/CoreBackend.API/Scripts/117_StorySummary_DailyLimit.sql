-- AI "In short" summary for long/voice stories + free-tier daily posting rhythm
-- (replaces the lifetime story cap: free users write 1 story per day, on-brand
-- with "one page a day"; premium is unlimited).
IF COL_LENGTH('dbo.Stories', 'Summary') IS NULL
BEGIN
    ALTER TABLE dbo.Stories
        ADD Summary NVARCHAR(1000) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Settings WHERE [Key] = 'stories.free.perday')
    INSERT INTO dbo.Settings ([Key],[Value],DataType,IsSecret,Description)
    VALUES ('stories.free.perday','1','int',0,'Stories a free (non-paid) user can create per UTC day; paid = unlimited');
GO
