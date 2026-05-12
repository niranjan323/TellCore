-- =============================================================================
-- 100_TheUntold_Seed.sql — TheUntold-specific seed
-- Idempotent: safe to re-run. Run AFTER 099_Seed.sql (depends on Products row).
-- Replaces the placeholder "warm-sepia" theme from 099 with the proper
-- "warm-paper" theme defined in docs/THEUNTOLD_DESIGN.md §3.
-- Adds the full TheUntold nav (Home / Today / Stories / Featured / Profile /
-- Family Vault / Notifications) and a FormSet that powers the daily prompt.
-- =============================================================================

DECLARE @theuntoldId         UNIQUEIDENTIFIER = '22222222-2222-2222-2222-222222222222';
DECLARE @warmPaperThemeId    UNIQUEIDENTIFIER = '22222222-3333-4444-5555-000000000003';
DECLARE @oldSepiaThemeId     UNIQUEIDENTIFIER = '22222222-3333-4444-5555-000000000002';
DECLARE @promptFormSetId     UNIQUEIDENTIFIER = '22222222-aaaa-bbbb-cccc-000000000001';
DECLARE @promptIntroId       UNIQUEIDENTIFIER = '22222222-bbbb-cccc-dddd-000000000001';

-- =============================================================================
-- Ensure product row exists (no-op if 099 already inserted it).
-- =============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Id = @theuntoldId)
BEGIN
    INSERT INTO dbo.Products (Id, Slug, Name, Description, IsActive, DefaultLanguage)
    VALUES (@theuntoldId, 'theuntold', 'TheUntold', 'Life story keeper', 1, 'en');
END

-- =============================================================================
-- Theme — warm-paper (matches THEUNTOLD_DESIGN.md §3)
-- =============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.Themes WHERE Id = @warmPaperThemeId)
BEGIN
    INSERT INTO dbo.Themes (Id, ProductId, Slug, Name, IsActive, IsDefault)
    VALUES (@warmPaperThemeId, @theuntoldId, 'warm-paper', 'Warm Paper', 1, 1);

    INSERT INTO dbo.ThemeVariables (ThemeId, [Key], [Value]) VALUES
    (@warmPaperThemeId, '--primary',           '#c08552'),
    (@warmPaperThemeId, '--primary-light',     '#f5e8dc'),
    (@warmPaperThemeId, '--primary-dark',      '#7a4f30'),
    (@warmPaperThemeId, '--surface',           '#fdfaf6'),
    (@warmPaperThemeId, '--surface-secondary', '#f5f0e8'),
    (@warmPaperThemeId, '--text-primary',      '#2b2421'),
    (@warmPaperThemeId, '--text-secondary',    '#5c534d'),
    (@warmPaperThemeId, '--text-hint',         '#a59a92'),
    (@warmPaperThemeId, '--border',            'rgba(89,71,55,0.12)'),
    (@warmPaperThemeId, '--accent',            '#d4a574'),
    (@warmPaperThemeId, '--radius-sm',         '6px'),
    (@warmPaperThemeId, '--radius-md',         '10px'),
    (@warmPaperThemeId, '--radius-lg',         '16px'),
    (@warmPaperThemeId, '--spacing-base',      '16px'),
    (@warmPaperThemeId, '--font-display',      '''Lora'', serif'),
    (@warmPaperThemeId, '--font-body',         '''Nunito'', sans-serif'),
    (@warmPaperThemeId, '--font-handwritten',  '''Caveat'', cursive'),
    (@warmPaperThemeId, '--font-size-base',    '16px');
END

-- Make warm-paper the default and deactivate the older warm-sepia placeholder.
UPDATE dbo.Themes
SET IsDefault = 0, IsActive = 0, UpdatedAt = SYSUTCDATETIME()
WHERE Id = @oldSepiaThemeId;

UPDATE dbo.Themes
SET IsDefault = 1, IsActive = 1, UpdatedAt = SYSUTCDATETIME()
WHERE Id = @warmPaperThemeId;

UPDATE dbo.Products
SET DefaultThemeId = @warmPaperThemeId, UpdatedAt = SYSUTCDATETIME()
WHERE Id = @theuntoldId;

-- =============================================================================
-- Navigation — full TheUntold tab + side nav set
-- Mobile bottom tabs: Home, Stories, Write (FAB), Featured, Profile
-- Additional registered/paid entries: Notifications, Family Vault
-- =============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.NavigationItems WHERE ProductId = @theuntoldId AND [Key] = 'today')
BEGIN
    -- Remove the minimal placeholder nav from 099 first (soft-delete).
    UPDATE dbo.NavigationItems
    SET IsDeleted = 1, UpdatedAt = SYSUTCDATETIME()
    WHERE ProductId = @theuntoldId AND [Key] IN ('home','history');

    DECLARE @navHome     UNIQUEIDENTIFIER = NEWID();
    DECLARE @navToday    UNIQUEIDENTIFIER = NEWID();
    DECLARE @navStories  UNIQUEIDENTIFIER = NEWID();
    DECLARE @navFeatured UNIQUEIDENTIFIER = NEWID();
    DECLARE @navProfile  UNIQUEIDENTIFIER = NEWID();
    DECLARE @navNotifs   UNIQUEIDENTIFIER = NEWID();
    DECLARE @navVault    UNIQUEIDENTIFIER = NEWID();

    INSERT INTO dbo.NavigationItems (Id, ProductId, [Key], Route, Icon, [Order], RequiredRole, IsVisible) VALUES
    (@navHome,     @theuntoldId, 'home',     '/',              'book-open',    1, 'guest',      1),
    (@navToday,    @theuntoldId, 'today',    '/today',         'pen-line',     2, 'guest',      1),
    (@navStories,  @theuntoldId, 'stories',  '/stories',       'library',      3, 'registered', 1),
    (@navFeatured, @theuntoldId, 'featured', '/featured',      'sparkles',     4, 'guest',      1),
    (@navProfile,  @theuntoldId, 'profile',  '/profile',       'user',         5, 'registered', 1),
    (@navNotifs,   @theuntoldId, 'notifs',   '/notifications', 'bell',         6, 'registered', 1),
    (@navVault,    @theuntoldId, 'vault',    '/vault',         'shield',       7, 'paid',       1);

    INSERT INTO dbo.NavigationTranslations (NavigationItemId, LanguageCode, Label) VALUES
    (@navHome,     'en', 'Home'),
    (@navToday,    'en', 'Today'),
    (@navStories,  'en', 'My Stories'),
    (@navFeatured, 'en', 'Featured'),
    (@navProfile,  'en', 'Profile'),
    (@navNotifs,   'en', 'Notifications'),
    (@navVault,    'en', 'Family Vault');
END

-- =============================================================================
-- FormSet — daily prompt (single-question form that captures a story)
-- The TheUntold frontend treats this FormSet as the source of the "today's prompt"
-- text (intro.body) plus the schema for the write/voice screens.
-- =============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.FormSets WHERE Id = @promptFormSetId)
BEGIN
    INSERT INTO dbo.FormSets (Id, ProductId, Slug, Name, Description, IsDefault, IsActive)
    VALUES (@promptFormSetId, @theuntoldId, 'daily-prompt', 'Daily story prompt',
            'One prompt a day — speak or write your story.', 1, 1);
END

UPDATE dbo.Products SET DefaultFormSetId = @promptFormSetId, UpdatedAt = SYSUTCDATETIME()
WHERE Id = @theuntoldId AND (DefaultFormSetId IS NULL OR DefaultFormSetId <> @promptFormSetId);

IF NOT EXISTS (SELECT 1 FROM dbo.Intros WHERE Id = @promptIntroId)
BEGIN
    INSERT INTO dbo.Intros (Id, FormSetId, IconKey, PrimaryButtonRoute, VoiceNoteEnabled)
    VALUES (@promptIntroId, @promptFormSetId, 'pen-line', '/today', 1);

    INSERT INTO dbo.IntroTranslations (IntroId, LanguageCode, Title, Subtitle, Body, PrimaryButtonLabel) VALUES
    (@promptIntroId, 'en',
        'Every life has a story worth keeping.',
        'Tell us one moment today.',
        'Write a moment from your childhood that still makes you smile. The smallest details — a smell, a sound, a person''s laugh — are the ones that travel the furthest.',
        'Tell this story');
END

IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE FormSetId = @promptFormSetId AND [Key] = 'story_text')
BEGIN
    DECLARE @qStoryText  UNIQUEIDENTIFIER = NEWID();
    DECLARE @qStoryTags  UNIQUEIDENTIFIER = NEWID();

    INSERT INTO dbo.Questions (Id, FormSetId, [Key], [Type], [Order], IsRequired, [Group], ConfigJson) VALUES
    (@qStoryText, @promptFormSetId, 'story_text', 'textarea', 1, 1, 'story', '{"maxLength":4000,"rows":12}'),
    (@qStoryTags, @promptFormSetId, 'story_tags', 'chips',    2, 0, 'story', '{"multi":true}');

    INSERT INTO dbo.QuestionTranslations (QuestionId, LanguageCode, Label, Placeholder, HelpText) VALUES
    (@qStoryText, 'en', 'Your story',  'Start anywhere — the first thing that comes to mind.', 'There is no wrong way to tell it.'),
    (@qStoryTags, 'en', 'Tag this story', NULL, 'Optional — helps your family find it later.');

    DECLARE @tagChildhood UNIQUEIDENTIFIER = NEWID();
    DECLARE @tagFamily    UNIQUEIDENTIFIER = NEWID();
    DECLARE @tagLove      UNIQUEIDENTIFIER = NEWID();
    DECLARE @tagLesson    UNIQUEIDENTIFIER = NEWID();
    DECLARE @tagRegret    UNIQUEIDENTIFIER = NEWID();
    DECLARE @tagJoy       UNIQUEIDENTIFIER = NEWID();

    INSERT INTO dbo.QuestionOptions (Id, QuestionId, [Value], [Order]) VALUES
    (@tagChildhood, @qStoryTags, 'childhood', 1),
    (@tagFamily,    @qStoryTags, 'family',    2),
    (@tagLove,      @qStoryTags, 'love',      3),
    (@tagLesson,    @qStoryTags, 'lesson',    4),
    (@tagRegret,    @qStoryTags, 'regret',    5),
    (@tagJoy,       @qStoryTags, 'joy',       6);

    INSERT INTO dbo.QuestionOptionTranslations (QuestionOptionId, LanguageCode, Label) VALUES
    (@tagChildhood, 'en', 'Childhood'),
    (@tagFamily,    'en', 'Family'),
    (@tagLove,      'en', 'Love'),
    (@tagLesson,    'en', 'A lesson'),
    (@tagRegret,    'en', 'Regret'),
    (@tagJoy,       'en', 'Joy');

    INSERT INTO dbo.SummaryTemplates (FormSetId, SectionKey, SectionTitle, [Order], QuestionKeysJson, PromptHint) VALUES
    (@promptFormSetId, 'story', 'The story', 1, '["story_text"]',
        'Preserve the writer''s voice. Light edits only — keep their words.');
END

GO
