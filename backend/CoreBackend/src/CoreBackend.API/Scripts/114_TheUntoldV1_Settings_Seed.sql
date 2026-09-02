-- =============================================================================
-- 114_TheUntoldV1_Settings_Seed.sql — settings for stories, payments, AI pipeline
-- Idempotent: safe to re-run. Secrets are seeded as placeholders; set real
-- values directly in the DB (UPDATE Settings SET [Value]=... WHERE [Key]=...) —
-- never commit real keys to git.
-- =============================================================================

IF NOT EXISTS (SELECT 1 FROM dbo.Settings WHERE [Key] = 'payments.provider')
    INSERT INTO dbo.Settings ([Key],[Value],DataType,IsSecret,Description)
    VALUES ('payments.provider','stripe','string',0,'Payment provider');

IF NOT EXISTS (SELECT 1 FROM dbo.Settings WHERE [Key] = 'payments.stripe.secretkey')
    INSERT INTO dbo.Settings ([Key],[Value],DataType,IsSecret,Description)
    VALUES ('payments.stripe.secretkey','YOUR_STRIPE_SECRET_KEY','string',1,'Stripe API secret key — secret');

IF NOT EXISTS (SELECT 1 FROM dbo.Settings WHERE [Key] = 'payments.stripe.webhooksecret')
    INSERT INTO dbo.Settings ([Key],[Value],DataType,IsSecret,Description)
    VALUES ('payments.stripe.webhooksecret','YOUR_STRIPE_WEBHOOK_SECRET','string',1,'Stripe webhook signing secret — secret');

IF NOT EXISTS (SELECT 1 FROM dbo.Settings WHERE [Key] = 'payments.stripe.price.monthly')
    INSERT INTO dbo.Settings ([Key],[Value],DataType,IsSecret,Description)
    VALUES ('payments.stripe.price.monthly','YOUR_PRICE_ID_MONTHLY','string',0,'Stripe Price id — premium monthly');

IF NOT EXISTS (SELECT 1 FROM dbo.Settings WHERE [Key] = 'payments.stripe.price.yearly')
    INSERT INTO dbo.Settings ([Key],[Value],DataType,IsSecret,Description)
    VALUES ('payments.stripe.price.yearly','YOUR_PRICE_ID_YEARLY','string',0,'Stripe Price id — premium yearly');

IF NOT EXISTS (SELECT 1 FROM dbo.Settings WHERE [Key] = 'ai.pipeline.url')
    INSERT INTO dbo.Settings ([Key],[Value],DataType,IsSecret,Description)
    VALUES ('ai.pipeline.url','http://localhost:8000','string',0,'Base URL of the internal FastAPI AI pipeline service');

IF NOT EXISTS (SELECT 1 FROM dbo.Settings WHERE [Key] = 'ai.pipeline.sharedsecret')
    INSERT INTO dbo.Settings ([Key],[Value],DataType,IsSecret,Description)
    VALUES ('ai.pipeline.sharedsecret','YOUR_PIPELINE_SHARED_SECRET','string',1,'Shared secret header for .NET → AI service calls — secret');

IF NOT EXISTS (SELECT 1 FROM dbo.Settings WHERE [Key] = 'ai.embedding.dimensions')
    INSERT INTO dbo.Settings ([Key],[Value],DataType,IsSecret,Description)
    VALUES ('ai.embedding.dimensions','384','int',0,'Embedding vector dimensions (multilingual-e5-small)');

IF NOT EXISTS (SELECT 1 FROM dbo.Settings WHERE [Key] = 'stories.preview.chars')
    INSERT INTO dbo.Settings ([Key],[Value],DataType,IsSecret,Description)
    VALUES ('stories.preview.chars','600','int',0,'Preview length (chars) of community stories for non-paid viewers');

IF NOT EXISTS (SELECT 1 FROM dbo.Settings WHERE [Key] = 'stories.free.storylimit')
    INSERT INTO dbo.Settings ([Key],[Value],DataType,IsSecret,Description)
    VALUES ('stories.free.storylimit','10','int',0,'Max stories a free (non-paid) user can create; paid = unlimited');

IF NOT EXISTS (SELECT 1 FROM dbo.Settings WHERE [Key] = 'app.theuntold.baseurl')
    INSERT INTO dbo.Settings ([Key],[Value],DataType,IsSecret,Description)
    VALUES ('app.theuntold.baseurl','http://localhost:5174','string',0,'Public base URL of the TheUntold web app (used in vault invite links)');

IF NOT EXISTS (SELECT 1 FROM dbo.Settings WHERE [Key] = 'payments.plans')
    INSERT INTO dbo.Settings ([Key],[Value],DataType,IsSecret,Description)
    VALUES ('payments.plans',
            '[{"key":"premium-monthly","name":"Premium","interval":"month","display":"$4.99 / month","description":"Full stories, multilingual AI, audio playback, family vault, unlimited stories."},{"key":"premium-yearly","name":"Premium Yearly","interval":"year","display":"$39 / year","description":"Everything in Premium — two months free."}]',
            'json',0,'Displayable billing plans (frontend renders this)');

GO
