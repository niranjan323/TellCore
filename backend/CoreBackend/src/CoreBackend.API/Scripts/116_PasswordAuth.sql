-- Email + password sign-in (BCrypt hash). Which auth methods the frontend
-- shows is backend-driven via the auth.methods setting.
IF COL_LENGTH('dbo.Users', 'PasswordHash') IS NULL
BEGIN
    ALTER TABLE dbo.Users
        ADD PasswordHash NVARCHAR(200) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Settings WHERE [Key] = 'auth.methods')
    INSERT INTO dbo.Settings ([Key],[Value],DataType,IsSecret,Description)
    VALUES ('auth.methods','["google","password","guest"]','json',0,
            'Sign-in methods the frontends offer, in display order');
GO

-- Guests need a way back to sign-in: make the profile tab visible to guests.
UPDATE dbo.NavigationItems
SET RequiredRole = 'guest', UpdatedAt = SYSUTCDATETIME()
WHERE [Key] = 'profile' AND RequiredRole <> 'guest' AND IsDeleted = 0;
GO
