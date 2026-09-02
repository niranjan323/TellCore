-- Public/private account flag: public profiles expose name + community stories;
-- private profiles show community stories anonymously ("A storyteller").
IF COL_LENGTH('dbo.Users', 'IsProfilePublic') IS NULL
BEGIN
    ALTER TABLE dbo.Users
        ADD IsProfilePublic BIT NOT NULL CONSTRAINT DF_Users_IsProfilePublic DEFAULT 1;
END
GO
