-- =============================================================================
-- 099_Seed.sql — Initial data for PreDoc and TheUntold
-- Idempotent: safe to re-run; only inserts rows that don't exist.
-- =============================================================================

DECLARE @predocId         UNIQUEIDENTIFIER = '11111111-1111-1111-1111-111111111111';
DECLARE @theuntoldId      UNIQUEIDENTIFIER = '22222222-2222-2222-2222-222222222222';

DECLARE @predocThemeId    UNIQUEIDENTIFIER = '11111111-2222-3333-4444-000000000001';
DECLARE @theuntoldThemeId UNIQUEIDENTIFIER = '22222222-3333-4444-5555-000000000002';

DECLARE @predocFormSetId  UNIQUEIDENTIFIER = '11111111-aaaa-bbbb-cccc-000000000001';
DECLARE @predocIntroId    UNIQUEIDENTIFIER = '11111111-bbbb-cccc-dddd-000000000001';

-- ============================================================================
-- Products
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'predoc')
BEGIN
    INSERT INTO dbo.Products (Id, Slug, Name, Description, IsActive, DefaultLanguage)
    VALUES (@predocId, 'predoc', 'PreDoc', 'Pre-Doctor Visit preparation', 1, 'en');
END

IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'theuntold')
BEGIN
    INSERT INTO dbo.Products (Id, Slug, Name, Description, IsActive, DefaultLanguage)
    VALUES (@theuntoldId, 'theuntold', 'TheUntold', 'Life story keeper', 1, 'en');
END

-- ============================================================================
-- Settings (platform-wide, ProductId NULL)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.Settings WHERE [Key] = 'ai.provider' AND ProductId IS NULL)
    INSERT INTO dbo.Settings ([Key],[Value],DataType,IsSecret,Description) VALUES
    ('ai.provider', 'null', 'string', 0, 'AI provider: null | groq | claude | openai');

IF NOT EXISTS (SELECT 1 FROM dbo.Settings WHERE [Key] = 'ai.groq.model' AND ProductId IS NULL)
    INSERT INTO dbo.Settings ([Key],[Value],DataType,IsSecret,Description) VALUES
    ('ai.groq.model', 'llama-3.3-70b-versatile', 'string', 0, 'Groq LLM model');

IF NOT EXISTS (SELECT 1 FROM dbo.Settings WHERE [Key] = 'ai.groq.whispermodel' AND ProductId IS NULL)
    INSERT INTO dbo.Settings ([Key],[Value],DataType,IsSecret,Description) VALUES
    ('ai.groq.whispermodel', 'whisper-large-v3', 'string', 0, 'Groq Whisper model');

IF NOT EXISTS (SELECT 1 FROM dbo.Settings WHERE [Key] = 'ai.groq.apikey' AND ProductId IS NULL)
    INSERT INTO dbo.Settings ([Key],[Value],DataType,IsSecret,Description) VALUES
    ('ai.groq.apikey', 'YOUR_GROQ_KEY_HERE', 'string', 1, 'Groq API key — secret');

IF NOT EXISTS (SELECT 1 FROM dbo.Settings WHERE [Key] = 'feature.voicenote.enabled' AND ProductId IS NULL)
    INSERT INTO dbo.Settings ([Key],[Value],DataType,IsSecret,Description) VALUES
    ('feature.voicenote.enabled', 'true', 'bool', 0, 'Enable voice notes');

IF NOT EXISTS (SELECT 1 FROM dbo.Settings WHERE [Key] = 'feature.history.enabled' AND ProductId IS NULL)
    INSERT INTO dbo.Settings ([Key],[Value],DataType,IsSecret,Description) VALUES
    ('feature.history.enabled', 'true', 'bool', 0, 'Enable session history');

IF NOT EXISTS (SELECT 1 FROM dbo.Settings WHERE [Key] = 'app.supportedlanguages' AND ProductId IS NULL)
    INSERT INTO dbo.Settings ([Key],[Value],DataType,IsSecret,Description) VALUES
    ('app.supportedlanguages', '["en","hi","te","es"]', 'json', 0, 'Supported languages');

-- ============================================================================
-- Themes — PreDoc "Calm Green"
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.Themes WHERE Id = @predocThemeId)
BEGIN
    INSERT INTO dbo.Themes (Id, ProductId, Slug, Name, IsActive, IsDefault)
    VALUES (@predocThemeId, @predocId, 'calm-green', 'Calm Green', 1, 1);

    INSERT INTO dbo.ThemeVariables (ThemeId, [Key], [Value]) VALUES
    (@predocThemeId, '--primary',           '#1d9e75'),
    (@predocThemeId, '--primary-light',     '#e1f5ee'),
    (@predocThemeId, '--primary-dark',      '#0f6e56'),
    (@predocThemeId, '--surface',           '#ffffff'),
    (@predocThemeId, '--surface-secondary', '#f7f7f5'),
    (@predocThemeId, '--text-primary',      '#1a1a1a'),
    (@predocThemeId, '--text-secondary',    '#666660'),
    (@predocThemeId, '--text-hint',         '#aaa9a3'),
    (@predocThemeId, '--border',            'rgba(0,0,0,0.1)'),
    (@predocThemeId, '--radius-sm',         '8px'),
    (@predocThemeId, '--radius-md',         '12px'),
    (@predocThemeId, '--radius-lg',         '16px'),
    (@predocThemeId, '--font-body',         '''Nunito'', sans-serif'),
    (@predocThemeId, '--font-size-base',    '15px'),
    (@predocThemeId, '--spacing-base',      '16px');
END

-- ============================================================================
-- Themes — TheUntold "Warm Sepia"
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.Themes WHERE Id = @theuntoldThemeId)
BEGIN
    INSERT INTO dbo.Themes (Id, ProductId, Slug, Name, IsActive, IsDefault)
    VALUES (@theuntoldThemeId, @theuntoldId, 'warm-sepia', 'Warm Sepia', 1, 1);

    INSERT INTO dbo.ThemeVariables (ThemeId, [Key], [Value]) VALUES
    (@theuntoldThemeId, '--primary',           '#8b5a2b'),
    (@theuntoldThemeId, '--primary-light',     '#f4ead9'),
    (@theuntoldThemeId, '--primary-dark',      '#5d3a18'),
    (@theuntoldThemeId, '--surface',           '#fffaf2'),
    (@theuntoldThemeId, '--surface-secondary', '#f7efe2'),
    (@theuntoldThemeId, '--text-primary',      '#2a1f12'),
    (@theuntoldThemeId, '--text-secondary',    '#6b5a45'),
    (@theuntoldThemeId, '--text-hint',         '#a89678'),
    (@theuntoldThemeId, '--border',            'rgba(0,0,0,0.1)'),
    (@theuntoldThemeId, '--radius-sm',         '8px'),
    (@theuntoldThemeId, '--radius-md',         '12px'),
    (@theuntoldThemeId, '--radius-lg',         '16px'),
    (@theuntoldThemeId, '--font-body',         '''Lora'', serif'),
    (@theuntoldThemeId, '--font-size-base',    '16px'),
    (@theuntoldThemeId, '--spacing-base',      '16px');
END

-- ============================================================================
-- Default theme pointers on Products
-- ============================================================================
UPDATE dbo.Products SET DefaultThemeId = @predocThemeId    WHERE Id = @predocId    AND DefaultThemeId IS NULL;
UPDATE dbo.Products SET DefaultThemeId = @theuntoldThemeId WHERE Id = @theuntoldId AND DefaultThemeId IS NULL;

-- ============================================================================
-- Navigation — PreDoc
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.NavigationItems WHERE ProductId = @predocId AND [Key] = 'home')
BEGIN
    DECLARE @navHome    UNIQUEIDENTIFIER = NEWID();
    DECLARE @navHistory UNIQUEIDENTIFIER = NEWID();
    DECLARE @navExport  UNIQUEIDENTIFIER = NEWID();

    INSERT INTO dbo.NavigationItems (Id, ProductId, [Key], Route, Icon, [Order], RequiredRole, IsVisible) VALUES
    (@navHome,    @predocId, 'home',    '/',         'home',     1, 'guest',      1),
    (@navHistory, @predocId, 'history', '/history',  'clock',    2, 'registered', 1),
    (@navExport,  @predocId, 'export',  '/export',   'download', 3, 'paid',       1);

    INSERT INTO dbo.NavigationTranslations (NavigationItemId, LanguageCode, Label) VALUES
    (@navHome,    'en', 'Home'),
    (@navHistory, 'en', 'My History'),
    (@navExport,  'en', 'Export PDF');
END

-- ============================================================================
-- Navigation — TheUntold
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.NavigationItems WHERE ProductId = @theuntoldId AND [Key] = 'home')
BEGIN
    DECLARE @navTuHome    UNIQUEIDENTIFIER = NEWID();
    DECLARE @navTuHistory UNIQUEIDENTIFIER = NEWID();

    INSERT INTO dbo.NavigationItems (Id, ProductId, [Key], Route, Icon, [Order], RequiredRole, IsVisible) VALUES
    (@navTuHome,    @theuntoldId, 'home',    '/',        'book-open',   1, 'guest',      1),
    (@navTuHistory, @theuntoldId, 'history', '/history', 'book-marked', 2, 'registered', 1);

    INSERT INTO dbo.NavigationTranslations (NavigationItemId, LanguageCode, Label) VALUES
    (@navTuHome,    'en', 'Stories'),
    (@navTuHistory, 'en', 'My Stories');
END

-- ============================================================================
-- PreDoc FormSet + Intro
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.FormSets WHERE Id = @predocFormSetId)
BEGIN
    INSERT INTO dbo.FormSets (Id, ProductId, Slug, Name, Description, IsDefault, IsActive)
    VALUES (@predocFormSetId, @predocId, 'general-visit', 'General Doctor Visit', 'Prep for a general doctor visit', 1, 1);
END

UPDATE dbo.Products SET DefaultFormSetId = @predocFormSetId WHERE Id = @predocId AND DefaultFormSetId IS NULL;

IF NOT EXISTS (SELECT 1 FROM dbo.Intros WHERE Id = @predocIntroId)
BEGIN
    INSERT INTO dbo.Intros (Id, FormSetId, IconKey, PrimaryButtonRoute, VoiceNoteEnabled)
    VALUES (@predocIntroId, @predocFormSetId, 'stethoscope', '/questions', 1);

    INSERT INTO dbo.IntroTranslations (IntroId, LanguageCode, Title, Subtitle, Body, PrimaryButtonLabel) VALUES
    (@predocIntroId, 'en',
        'Get ready for your visit',
        'A few minutes now will save time at the doctor',
        'Answer a short set of questions about how you''re feeling. Optionally record a voice note. We''ll organise everything into a clear summary you can share with your doctor.',
        'Start');
END

-- ============================================================================
-- PreDoc Questions
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.Questions WHERE FormSetId = @predocFormSetId AND [Key] = 'main_concern')
BEGIN
    DECLARE @qMainConcern   UNIQUEIDENTIFIER = NEWID();
    DECLARE @qSeverity      UNIQUEIDENTIFIER = NEWID();
    DECLARE @qDuration      UNIQUEIDENTIFIER = NEWID();
    DECLARE @qBodyLocations UNIQUEIDENTIFIER = NEWID();
    DECLARE @qMedications   UNIQUEIDENTIFIER = NEWID();
    DECLARE @qAllergies     UNIQUEIDENTIFIER = NEWID();
    DECLARE @qExtraNotes    UNIQUEIDENTIFIER = NEWID();

    INSERT INTO dbo.Questions (Id, FormSetId, [Key], [Type], [Order], IsRequired, [Group], ConfigJson) VALUES
    (@qMainConcern,   @predocFormSetId, 'main_concern',   'textarea',  1, 1, 'symptoms',   NULL),
    (@qSeverity,      @predocFormSetId, 'severity',       'slider',    2, 1, 'symptoms',   '{"min":1,"max":10,"step":1}'),
    (@qDuration,      @predocFormSetId, 'duration',       'chips',     3, 1, 'symptoms',   '{"multi":false}'),
    (@qBodyLocations, @predocFormSetId, 'body_locations', 'chips',     4, 0, 'symptoms',   '{"multi":true}'),
    (@qMedications,   @predocFormSetId, 'medications',    'textinput', 5, 0, 'history',    NULL),
    (@qAllergies,     @predocFormSetId, 'allergies',      'textinput', 6, 0, 'history',    NULL),
    (@qExtraNotes,    @predocFormSetId, 'extra_notes',    'textarea',  7, 0, 'additional', NULL);

    INSERT INTO dbo.QuestionTranslations (QuestionId, LanguageCode, Label, Placeholder, HelpText) VALUES
    (@qMainConcern,   'en', 'What''s the main reason for your visit?',          'Describe what you''re feeling', 'Be as specific as you can'),
    (@qSeverity,      'en', 'How would you rate it from 1 to 10?',               NULL, '1 = barely noticeable, 10 = unbearable'),
    (@qDuration,      'en', 'How long has it been going on?',                    NULL, NULL),
    (@qBodyLocations, 'en', 'Where do you feel it?',                             NULL, 'Select all that apply'),
    (@qMedications,   'en', 'Any medications you''re currently taking?',         'e.g. ibuprofen, vitamin D', NULL),
    (@qAllergies,     'en', 'Any known allergies?',                              'e.g. peanuts, penicillin', NULL),
    (@qExtraNotes,    'en', 'Anything else you''d like your doctor to know?',    'Optional', NULL);

    -- Options for duration
    DECLARE @optHours UNIQUEIDENTIFIER = NEWID();
    DECLARE @optDays  UNIQUEIDENTIFIER = NEWID();
    DECLARE @optWeeks UNIQUEIDENTIFIER = NEWID();
    DECLARE @optMonth UNIQUEIDENTIFIER = NEWID();

    INSERT INTO dbo.QuestionOptions (Id, QuestionId, [Value], [Order]) VALUES
    (@optHours, @qDuration, 'hours',  1),
    (@optDays,  @qDuration, 'days',   2),
    (@optWeeks, @qDuration, 'weeks',  3),
    (@optMonth, @qDuration, 'months', 4);

    INSERT INTO dbo.QuestionOptionTranslations (QuestionOptionId, LanguageCode, Label) VALUES
    (@optHours, 'en', 'A few hours'),
    (@optDays,  'en', 'A few days'),
    (@optWeeks, 'en', 'A few weeks'),
    (@optMonth, 'en', 'A month or more');

    -- Options for body locations
    DECLARE @locHead   UNIQUEIDENTIFIER = NEWID();
    DECLARE @locChest  UNIQUEIDENTIFIER = NEWID();
    DECLARE @locAbdomen UNIQUEIDENTIFIER = NEWID();
    DECLARE @locBack   UNIQUEIDENTIFIER = NEWID();
    DECLARE @locLimbs  UNIQUEIDENTIFIER = NEWID();

    INSERT INTO dbo.QuestionOptions (Id, QuestionId, [Value], [Order]) VALUES
    (@locHead,    @qBodyLocations, 'head',    1),
    (@locChest,   @qBodyLocations, 'chest',   2),
    (@locAbdomen, @qBodyLocations, 'abdomen', 3),
    (@locBack,    @qBodyLocations, 'back',    4),
    (@locLimbs,   @qBodyLocations, 'limbs',   5);

    INSERT INTO dbo.QuestionOptionTranslations (QuestionOptionId, LanguageCode, Label) VALUES
    (@locHead,    'en', 'Head'),
    (@locChest,   'en', 'Chest'),
    (@locAbdomen, 'en', 'Abdomen'),
    (@locBack,    'en', 'Back'),
    (@locLimbs,   'en', 'Arms or legs');

    -- Summary templates
    INSERT INTO dbo.SummaryTemplates (FormSetId, SectionKey, SectionTitle, [Order], QuestionKeysJson, PromptHint) VALUES
    (@predocFormSetId, 'symptoms',   'Symptoms',            1, '["main_concern","severity","duration","body_locations"]', 'Summarize symptoms clearly.'),
    (@predocFormSetId, 'history',    'Medical history',     2, '["medications","allergies"]',                              'List medications and allergies.'),
    (@predocFormSetId, 'additional', 'Additional notes',    3, '["extra_notes"]',                                          'Anything else the doctor should know.');
END

GO
