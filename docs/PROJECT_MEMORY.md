# Project Memory — TellCore Platform
> This document is the single source of truth for the Claude agent.
> Read this fully before making any decision, writing any code, or suggesting any change.
> If something is not in this document, ask the developer before proceeding.
> This document covers everything from repo creation to production readiness.

---

## 1. Platform Overview

This is a multi-product platform. One shared backend powers multiple independent frontend apps.
The root project is called **TellCore**.
The backend is called **CoreBackend**.
The first two frontend apps are **PreDoc** and **TheUntold**.
More apps will be added in the future — every decision must support that.

### Products

| Product | Slug | Description | Status |
|---|---|---|---|
| PreDoc | predoc | Pre-Doctor Visit preparation. Helps users explain symptoms clearly to their doctor. | Build first |
| TheUntold | theuntold | Life story keeper. Helps people record and preserve their unshared life stories for family. | Build second |

### Core Philosophy
- **Backend is the brain. Frontend is the hands.**
- Frontend never decides content, pages, navigation, themes, or styles.
- Everything comes from backend. Frontend only renders what it receives.
- One backend change affects all frontends instantly.
- No feature is hardcoded on the frontend ever.
- Build locally first. Host later. One step at a time.

---

## 2. Repository Structure — Monorepo

**One Git repository. Three solutions inside it.**
Backend and both frontends live together.
Agent can see and edit all three in one session.
Contracts stay in sync between backend and frontend automatically.

### Root Folder Name
```
TellCore/
```

### Full Monorepo Structure
```
TellCore/                                   ← Git repo root
│
├── backend/
│   └── CoreBackend/                        ← ASP.NET Core solution
│       ├── CoreBackend.sln
│       └── src/
│           ├── CoreBackend.API/
│           ├── CoreBackend.Application/
│           ├── CoreBackend.Domain/
│           ├── CoreBackend.Infrastructure/
│           └── CoreBackend.Contracts/
│
├── apps/
│   ├── predoc/                             ← PreDoc Vite React app
│   │   ├── public/
│   │   ├── src/
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tailwind.config.ts
│   │   ├── vite.config.ts
│   │   └── .env.local
│   │
│   └── theuntold/                          ← TheUntold Vite React app
│       ├── public/
│       ├── src/
│       ├── index.html
│       ├── package.json
│       ├── tailwind.config.ts
│       ├── vite.config.ts
│       └── .env.local
│
├── docs/
│   └── PROJECT_MEMORY.md                   ← agent reads this first always
│
├── .gitignore
└── README.md
```

---

## 3. Step Zero — Creating Everything From Scratch

Agent follows this exact sequence when starting from nothing.

### Step 0.1 — Create Root Folder and Git Repo
```bash
mkdir TellCore
cd TellCore
git init
echo "# TellCore Platform" > README.md
```

### Step 0.2 — Create .gitignore
Create `.gitignore` at root with entries for:
- .NET: `bin/`, `obj/`, `*.user`, `.vs/`, `appsettings.Development.json`
- Node: `node_modules/`, `dist/`, `.env.local`
- General: `.DS_Store`, `Thumbs.db`, `uploads/`

### Step 0.3 — Create Folder Structure
```bash
mkdir -p backend/CoreBackend/src
mkdir -p apps/predoc
mkdir -p apps/theuntold
mkdir -p docs
```

### Step 0.4 — Create CoreBackend Solution
```bash
cd backend/CoreBackend
dotnet new sln -n CoreBackend
dotnet new webapi -n CoreBackend.API -o src/CoreBackend.API
dotnet new classlib -n CoreBackend.Application -o src/CoreBackend.Application
dotnet new classlib -n CoreBackend.Domain -o src/CoreBackend.Domain
dotnet new classlib -n CoreBackend.Infrastructure -o src/CoreBackend.Infrastructure
dotnet new classlib -n CoreBackend.Contracts -o src/CoreBackend.Contracts
dotnet sln add src/CoreBackend.API/CoreBackend.API.csproj
dotnet sln add src/CoreBackend.Application/CoreBackend.Application.csproj
dotnet sln add src/CoreBackend.Domain/CoreBackend.Domain.csproj
dotnet sln add src/CoreBackend.Infrastructure/CoreBackend.Infrastructure.csproj
dotnet sln add src/CoreBackend.Contracts/CoreBackend.Contracts.csproj
```

### Step 0.5 — Add Project References
```bash
# API → Application, Infrastructure, Contracts
cd src/CoreBackend.API
dotnet add reference ../CoreBackend.Application/CoreBackend.Application.csproj
dotnet add reference ../CoreBackend.Infrastructure/CoreBackend.Infrastructure.csproj
dotnet add reference ../CoreBackend.Contracts/CoreBackend.Contracts.csproj

# Application → Domain, Contracts
cd ../CoreBackend.Application
dotnet add reference ../CoreBackend.Domain/CoreBackend.Domain.csproj
dotnet add reference ../CoreBackend.Contracts/CoreBackend.Contracts.csproj

# Infrastructure → Application, Domain
cd ../CoreBackend.Infrastructure
dotnet add reference ../CoreBackend.Application/CoreBackend.Application.csproj
dotnet add reference ../CoreBackend.Domain/CoreBackend.Domain.csproj
```

### Step 0.6 — Add NuGet Packages

**CoreBackend.API**
```bash
dotnet add package Microsoft.AspNetCore.OpenApi
dotnet add package Scalar.AspNetCore
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.Console
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package FluentValidation.AspNetCore
```

**CoreBackend.Application**
```bash
dotnet add package MediatR
dotnet add package FluentValidation
dotnet add package FluentValidation.DependencyInjectionExtensions
dotnet add package Microsoft.Extensions.Logging.Abstractions
```

**CoreBackend.Infrastructure**
```bash
dotnet add package Dapper
dotnet add package Microsoft.Data.SqlClient
dotnet add package BCrypt.Net-Next
dotnet add package Microsoft.Extensions.Configuration.Abstractions
dotnet add package Microsoft.Extensions.Http
```

**CoreBackend.Domain** — no packages. Pure C# only.
**CoreBackend.Contracts** — no packages. Pure C# only.

### Step 0.7 — Create PreDoc React App
```bash
cd TellCore/apps
npm create vite@latest predoc -- --template react-ts
cd predoc
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install axios @tanstack/react-query zustand react-router-dom
npm install @react-pdf/renderer
npm install lucide-react
```

### Step 0.8 — Create TheUntold React App
```bash
cd TellCore/apps
npm create vite@latest theuntold -- --template react-ts
cd theuntold
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install axios @tanstack/react-query zustand react-router-dom
npm install @react-pdf/renderer
npm install lucide-react
```

### Step 0.9 — First Commit
```bash
cd TellCore
git add .
git commit -m "chore: initial monorepo structure"
```

---

## 4. CoreBackend — Project Details

### Technology
- ASP.NET Core Web API — .NET 10 — **single project**
- SQL Server — database
- Dapper — all database access (NO Entity Framework, NO ORM ever)
- All SQL written manually in the repository layer
- Schema managed by plain `.sql` scripts — no migration tool
- ~~MediatR — CQRS pattern~~ → removed (updated 2026-05-11: simplified to direct Controller → Service → Repository pattern)
- FluentValidation — input validation
- Serilog — structured logging
- JWT — authentication tokens
- Google OAuth — social login
- Groq API — AI summarisation and voice transcription (via HttpClient, no SDK)

### Pattern Rules

| Layer | Owns | Rules |
|---|---|---|
| Controllers | HTTP endpoints only | Call services only — no business logic, no SQL |
| Services | Business logic | Call repositories — implement interface + class |
| Repositories | All SQL via Dapper | Implement interface + class — raw SQL only |
| Models | Entities + DTOs | No logic — just shape |
| Middleware | Cross-cutting concerns | Exception handling, logging |

### CoreBackend Internal Structure
```
CoreBackend.API/
├── Controllers/
│   ├── AuthController.cs
│   ├── ConfigController.cs
│   ├── FormsController.cs
│   ├── NavigationController.cs
│   ├── ResponsesController.cs
│   ├── SessionsController.cs
│   └── ThemesController.cs
├── Models/
│   ├── Entities/
│   │   ├── Product.cs
│   │   ├── Setting.cs
│   │   ├── NavigationItem.cs
│   │   ├── Theme.cs
│   │   ├── FormSet.cs
│   │   ├── Intro.cs
│   │   ├── Question.cs
│   │   ├── Session.cs
│   │   └── User.cs
│   ├── Requests/
│   └── Responses/
├── Services/
│   ├── Interfaces/
│   │   ├── IAuthService.cs
│   │   ├── IJwtService.cs
│   │   ├── IGoogleAuthService.cs
│   │   ├── IAiSummaryService.cs
│   │   ├── IVoiceTranscriptionService.cs
│   │   ├── IFileStorageService.cs
│   │   └── ISummaryFormatterService.cs
│   ├── AuthService.cs
│   ├── JwtService.cs
│   ├── GoogleAuthService.cs
│   ├── GroqAiSummaryService.cs
│   ├── NullAiSummaryService.cs
│   ├── LocalFileStorageService.cs
│   └── SummaryFormatterService.cs
├── Repositories/
│   ├── Interfaces/
│   │   ├── IUserRepository.cs
│   │   ├── IProductRepository.cs
│   │   ├── ISettingsRepository.cs
│   │   ├── INavigationRepository.cs
│   │   ├── IThemeRepository.cs
│   │   ├── IFormSetRepository.cs
│   │   ├── ISessionRepository.cs
│   │   ├── IAnswerRepository.cs
│   │   └── ISummaryRepository.cs
│   ├── DbConnectionFactory.cs
│   ├── UserRepository.cs
│   ├── ProductRepository.cs
│   ├── SettingsRepository.cs
│   ├── NavigationRepository.cs
│   ├── ThemeRepository.cs
│   ├── FormSetRepository.cs
│   ├── SessionRepository.cs
│   ├── AnswerRepository.cs
│   └── SummaryRepository.cs
├── Middleware/
│   └── ExceptionMiddleware.cs
├── Scripts/
│   ├── 001_Products.sql
│   ├── 002_Settings.sql
│   ├── 003_Users.sql
│   ├── 004_RefreshTokens.sql
│   ├── 005_NavigationItems.sql
│   ├── 006_NavigationTranslations.sql
│   ├── 007_Themes.sql
│   ├── 008_ThemeVariables.sql
│   ├── 009_FormSets.sql
│   ├── 010_Intros.sql
│   ├── 011_IntroTranslations.sql
│   ├── 012_Questions.sql
│   ├── 013_QuestionTranslations.sql
│   ├── 014_QuestionOptions.sql
│   ├── 015_QuestionOptionTranslations.sql
│   ├── 016_QuestionConditions.sql
│   ├── 017_SummaryTemplates.sql
│   ├── 018_Sessions.sql
│   ├── 019_Answers.sql
│   ├── 020_Summaries.sql
│   ├── 021_AuditLogs.sql
│   └── 099_Seed.sql
├── appsettings.json
└── Program.cs
```

---

## 5. Database Design

### Rules
- All tables have audit columns — no exceptions
- Soft delete only — never hard delete rows
- All SQL written in repository layer using Dapper
- Table scripts in `CoreBackend.Infrastructure/Persistence/Scripts/`
- Run scripts manually in order (001, 002, 003...)
- Seed data in `099_Seed.sql`

### Audit Columns — Every Single Table
```sql
Id          UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID() PRIMARY KEY,
CreatedAt   DATETIME2         NOT NULL DEFAULT GETUTCDATE(),
UpdatedAt   DATETIME2         NULL,
CreatedBy   UNIQUEIDENTIFIER  NULL,
UpdatedBy   UNIQUEIDENTIFIER  NULL,
IsDeleted   BIT               NOT NULL DEFAULT 0
```

### All Tables
```
Products                     platform products (predoc, theuntold, future)
Settings                     all configuration — feature flags, AI keys, app config
Users                        guest + registered + paid users
RefreshTokens                JWT refresh token storage
NavigationItems              menu items per product per user role
NavigationTranslations       nav item labels per language
Themes                       CSS variable sets per product
ThemeVariables               individual CSS variable rows per theme
FormSets                     named question sets per product
Intros                       intro config per form set
IntroTranslations            intro text + audio URL per language
Questions                    all questions across all products
QuestionTranslations         question label, placeholder per language
QuestionOptions              selectable options for chips/radio/checkbox
QuestionOptionTranslations   option display labels per language
QuestionConditions           show/hide logic rules per question
SummaryTemplates             how answers map to output sections
Sessions                     one per user form journey
Answers                      one row per question per session
Summaries                    processed AI or rule-based output
AuditLogs                    change tracking
```

### Settings Table Design
```sql
CREATE TABLE Settings (
    Id          UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID() PRIMARY KEY,
    CreatedAt   DATETIME2         NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt   DATETIME2         NULL,
    CreatedBy   UNIQUEIDENTIFIER  NULL,
    UpdatedBy   UNIQUEIDENTIFIER  NULL,
    IsDeleted   BIT               NOT NULL DEFAULT 0,
    ProductId   UNIQUEIDENTIFIER  NULL,         -- NULL = platform-wide
    [Key]       NVARCHAR(200)     NOT NULL,
    [Value]     NVARCHAR(MAX)     NOT NULL,
    DataType    NVARCHAR(50)      NOT NULL,     -- "string", "bool", "int", "json"
    Description NVARCHAR(500)     NULL,
    IsSecret    BIT               NOT NULL DEFAULT 0  -- never send to frontend
)
```

### Settings Seed Data
```sql
INSERT INTO Settings ([Key],[Value],DataType,IsSecret,Description) VALUES
('ai.provider',               'groq',                    'string',0,'AI provider'),
('ai.groq.model',             'llama-3.3-70b-versatile', 'string',0,'Groq LLM model'),
('ai.groq.whispermodel',      'whisper-large-v3',        'string',0,'Groq Whisper model'),
('ai.groq.apikey',            'YOUR_GROQ_KEY_HERE',      'string',1,'Groq API key — secret'),
('feature.voicenote.enabled', 'true',                    'bool',  0,'Enable voice notes'),
('feature.history.enabled',   'true',                    'bool',  0,'Enable session history'),
('app.supportedlanguages',    '["en","hi","te","es"]',   'json',  0,'Supported languages')
```

---

## 6. Authentication

### User Types

| Type | Created By | JWT Expiry | Access |
|---|---|---|---|
| Guest | Auto on first app open | 24hr | Limited screens, no history |
| Registered Free | Google OAuth | 1hr + 30d refresh | All guest + history + saved summaries |
| Paid | Subscribed | 1hr + 30d refresh | All free + PDF export + multilingual + priority AI |

### Users Table Key Columns
```sql
UserType              NVARCHAR(20)   -- 'guest', 'registered', 'paid'
Email                 NVARCHAR(200)  NULL
GoogleId              NVARCHAR(200)  NULL
DeviceToken           NVARCHAR(500)  NULL   -- guest identification
SubscriptionExpiresAt DATETIME2      NULL
```

### Guest Flow
1. App opens → frontend calls `POST /api/v1/auth/guest`
2. Backend creates User (UserType = 'guest') with DeviceToken
3. Returns JWT (24hr)
4. Guest completes full form journey without any account
5. Guest can upgrade — session history carries over

### Google OAuth Flow
1. Frontend handles Google sign-in → gets Google ID token
2. Sends to `POST /api/v1/auth/google`
3. Backend validates with Google APIs
4. Creates or finds User → UserType = 'registered'
5. Returns JWT + refresh token

### JWT Contents
- UserId, UserType, Email (if registered)
- Access token: 1 hour
- Refresh token: 30 days, stored in RefreshTokens table
- Guest token: 24 hours

---

## 7. Backend-Driven Navigation

### How It Works
1. Frontend calls `GET /api/v1/products/{slug}/navigation` with JWT
2. Backend reads UserType from JWT claims
3. Queries NavigationItems filtered by ProductId + UserType
4. Returns ordered list
5. Frontend renders exactly this — no filtering, no role checks ever

### Navigation Response Shape
```json
{
  "items": [
    { "key": "home",    "label": "Home",       "route": "/",        "icon": "home",  "order": 1 },
    { "key": "history", "label": "My History", "route": "/history", "icon": "clock", "order": 2 }
  ]
}
```

### NavigationItems Table Key Columns
```sql
ProductId     UNIQUEIDENTIFIER
[Key]         NVARCHAR(100)   -- "home", "history", "export"
Route         NVARCHAR(200)   -- "/", "/history"
Icon          NVARCHAR(100)   -- lucide icon name
[Order]       INT
RequiredRole  NVARCHAR(20)    -- "guest", "registered", "paid"
IsVisible     BIT
```

### Rule
Backend returns ONLY items the current user type can see.
Frontend never checks roles. Frontend never filters.
If item is not in response — it does not exist for that user.

---

## 8. Theme System

### How It Works
1. Frontend calls `GET /api/v1/products/{slug}/themes/active`
2. Backend returns CSS variable map
3. Frontend injects into document `:root`
4. Every component uses `var(--*)` only — zero hardcoded values
5. Backend changes theme → entire app changes on next load

### Theme API Response
```json
{
  "slug": "calm-green",
  "name": "Calm Green",
  "variables": {
    "--primary":           "#1d9e75",
    "--primary-light":     "#e1f5ee",
    "--primary-dark":      "#0f6e56",
    "--surface":           "#ffffff",
    "--surface-secondary": "#f7f7f5",
    "--text-primary":      "#1a1a1a",
    "--text-secondary":    "#666660",
    "--text-hint":         "#aaa9a3",
    "--border":            "rgba(0,0,0,0.1)",
    "--radius-sm":         "8px",
    "--radius-md":         "12px",
    "--radius-lg":         "16px",
    "--font-body":         "'Nunito', sans-serif",
    "--font-size-base":    "15px",
    "--spacing-base":      "16px"
  }
}
```

### Frontend Theme Injection
```ts
// src/theme/injectTheme.ts
export function injectTheme(variables: Record<string, string>) {
  const root = document.documentElement;
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}
```

### Tailwind Configuration
```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary:             'var(--primary)',
      'primary-light':     'var(--primary-light)',
      'primary-dark':      'var(--primary-dark)',
      surface:             'var(--surface)',
      'surface-secondary': 'var(--surface-secondary)',
    },
    borderRadius: {
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
    },
    fontFamily: {
      body: ['var(--font-body)'],
    }
  }
}
```

### Theme Hard Rule
No color, font, size, radius, or spacing is hardcoded in any component.
Use only Tailwind classes that reference CSS variables.
`className="bg-primary text-surface rounded-md"` — correct.
`style={{ color: '#1d9e75' }}` — never.

---

## 9. Forms Engine

### How It Works
1. Frontend calls `GET /api/v1/products/{slug}/forms/default?lang=en`
2. Backend returns full form config — intro, questions, options, conditions
3. Frontend renders whatever it receives — no hardcoded questions
4. User completes form → `POST /api/v1/responses`
5. Backend processes → AI summarises → returns `sections[]`
6. Frontend renders summary → user generates PDF from rendered view

### Question Types Frontend Must Support

| Type | Renders As |
|---|---|
| textarea | Multiline free text |
| textinput | Single line text |
| chips | Tap-to-select pills, single or multi |
| radio | Single choice list |
| checkbox | Multi choice list |
| bodymap | Interactive SVG body diagram |
| slider | Numeric range e.g. pain scale 1–10 |
| datepicker | Date selection |
| infoblock | Non-question, displays text only |

### Condition Logic (client-side evaluation)
```ts
// ConditionEngine.ts — pure function, no side effects
export function shouldShowQuestion(
  question: QuestionResponse,
  answers: Record<string, unknown>
): boolean {
  if (!question.conditions.length) return true;
  return question.conditions.every(c => {
    const answer = answers[c.dependsOnKey];
    const values = JSON.parse(c.valuesJson);
    switch (c.operator) {
      case 'in':         return values.includes(answer);
      case 'not_in':     return !values.includes(answer);
      case 'equals':     return answer === values[0];
      case 'not_equals': return answer !== values[0];
      default:           return true;
    }
  });
}
```

### Voice Note Flow
1. User records on intro screen (optional)
2. Frontend uploads blob → `POST /api/v1/sessions/{id}/voice`
3. Backend saves locally (dev) → returns file URL
4. On submit, voice URL included in payload
5. Backend transcribes with Groq Whisper
6. Transcript passed to AI summariser with answers

---

## 10. AI Integration — Groq

### Current Setup (Development)
- Provider: Groq free tier
- LLM model: `llama-3.3-70b-versatile`
- Whisper model: `whisper-large-v3`
- API key in Settings table only (IsSecret = true) — never in appsettings.json
- Called via HttpClient — no SDK

### What AI Does
1. Receives raw key-value answers + voice transcript
2. Removes filler, irrelevant, repeated content
3. Rewrites into clean natural language sections
4. Translates to user's requested language
5. Flags missing critical information
6. Never diagnoses — only organises and clarifies

### AI Interface
```csharp
// Application layer — Infrastructure implements this
public interface IAiSummaryService
{
    // Returns null → rule-based formatter takes over
    Task<AiSummaryResult?> GenerateSummaryAsync(
        AiSummaryRequest request, CancellationToken ct = default);
}

public interface IVoiceTranscriptionService
{
    // Returns null → continue without transcript
    Task<string?> TranscribeAsync(
        Stream audioStream, string languageCode, CancellationToken ct = default);
}
```

### Summary Fallback Chain
```
AI summary attempted
  → success:   return AI sections[]
  → null/fail: rule-based formatter runs
    → success: return formatted sections[]
    → fail:    return raw answers as sections[]
```

### AI Swap Rule
- `ai.provider` setting in Settings table controls which implementation loads
- Swap by changing setting value — zero code changes
- Implementations: `NullAiSummaryService`, `GroqAiSummaryService`
- Future: `ClaudeAiSummaryService`, `OpenAiSummaryService`

---

## 11. API Endpoints — Complete List

```
── Auth ──────────────────────────────────────────────────────────────
POST   /api/v1/auth/guest
       Body: { deviceToken }
       Returns: { accessToken, refreshToken, userType }

POST   /api/v1/auth/google
       Body: { idToken }
       Returns: { accessToken, refreshToken, userType }

POST   /api/v1/auth/refresh
       Body: { refreshToken }
       Returns: { accessToken, refreshToken }

POST   /api/v1/auth/logout
       Body: { refreshToken }
       Returns: 200 OK

── Config ────────────────────────────────────────────────────────────
GET    /api/v1/products/{slug}/config
       Returns: { defaultLanguage, defaultThemeSlug, defaultFormSetSlug, supportedLanguages }

── Navigation ────────────────────────────────────────────────────────
GET    /api/v1/products/{slug}/navigation
       Header: Authorization: Bearer {jwt}
       Returns: { items[] } filtered by user role from JWT

── Themes ────────────────────────────────────────────────────────────
GET    /api/v1/products/{slug}/themes/active
       Returns: { slug, name, variables{} }

GET    /api/v1/products/{slug}/themes/{themeSlug}
       Returns: { slug, name, variables{} }

── Forms ─────────────────────────────────────────────────────────────
GET    /api/v1/products/{slug}/forms/default?lang=en
       Returns: { formSetId, intro{}, questions[] }

GET    /api/v1/products/{slug}/forms/{formSlug}?lang=en
       Returns: { formSetId, intro{}, questions[] }

── Sessions ──────────────────────────────────────────────────────────
POST   /api/v1/sessions
       Body: { productSlug, formSetId, languageCode }
       Returns: { sessionId }

POST   /api/v1/sessions/{id}/voice
       Body: multipart audio file
       Returns: { voiceNoteUrl }

── Responses ─────────────────────────────────────────────────────────
POST   /api/v1/responses
       Body: { sessionId, formSetId, languageCode, answers{}, voiceNoteUrl? }
       Returns: { sessionId, title, subtitle, disclaimer, sections[], isAiGenerated, generatedAt }

GET    /api/v1/responses/{sessionId}/summary
       Returns: { sessionId, title, subtitle, disclaimer, sections[], isAiGenerated, generatedAt }

── User ──────────────────────────────────────────────────────────────
GET    /api/v1/users/me
       Header: Authorization: Bearer {jwt}
       Returns: { userId, userType, email? }

GET    /api/v1/users/me/sessions
       Header: Authorization: Bearer {jwt}
       Returns: { sessions[] } — registered users only

DELETE /api/v1/users/me
       Soft deletes user and all their data

── Settings (non-secret only) ────────────────────────────────────────
GET    /api/v1/settings/{key}
       Returns: { key, value, dataType }
       Rule: Never returns IsSecret = true settings
```

---

## 12. Frontend Structure — Both Apps Same Pattern

### Technology
- Vite + React + TypeScript
- Tailwind CSS configured to CSS variables
- TanStack Query — server state and API calls
- Zustand — client state (auth, active session)
- React Router v6 — routing
- Axios — HTTP client with JWT interceptor
- @react-pdf/renderer — PDF generation (MIT license)
- lucide-react — icons

### Folder Structure
```
src/
├── api/
│   ├── client.ts              ← Axios instance, JWT interceptor, auto-refresh
│   ├── auth.api.ts
│   ├── config.api.ts
│   ├── forms.api.ts
│   ├── navigation.api.ts
│   ├── responses.api.ts
│   ├── sessions.api.ts
│   └── themes.api.ts
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx       ← renders nav from API data only
│   │   └── NavBar.tsx
│   ├── questions/
│   │   ├── QuestionRenderer.tsx   ← maps type string → component
│   │   ├── ConditionEngine.ts     ← pure functions, no side effects
│   │   ├── TextAreaQuestion.tsx
│   │   ├── TextInputQuestion.tsx
│   │   ├── ChipsQuestion.tsx
│   │   ├── RadioQuestion.tsx
│   │   ├── CheckboxQuestion.tsx
│   │   ├── BodyMapQuestion.tsx
│   │   ├── SliderQuestion.tsx
│   │   ├── DateQuestion.tsx
│   │   └── InfoBlock.tsx
│   ├── summary/
│   │   ├── SummaryView.tsx
│   │   └── PdfExport.tsx
│   ├── voice/
│   │   └── VoiceRecorder.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Spinner.tsx
│       └── ErrorMessage.tsx
├── hooks/
│   ├── useAppConfig.ts
│   ├── useTheme.ts            ← fetches theme, calls injectTheme
│   ├── useNavigation.ts
│   ├── useFormSet.ts
│   └── useSession.ts
├── store/
│   ├── authStore.ts           ← accessToken, userType, userId
│   └── sessionStore.ts        ← formSetId, answers, currentStep
├── pages/
│   ├── IntroPage.tsx
│   ├── QuestionsPage.tsx
│   ├── SummaryPage.tsx
│   ├── HistoryPage.tsx        ← registered users only
│   └── AuthPage.tsx
├── theme/
│   └── injectTheme.ts
├── types/
│   └── contracts.ts           ← TypeScript types matching CoreBackend.Contracts exactly
├── App.tsx                    ← startup sequence, router, query client
└── main.tsx
```

### App Startup Sequence
```
App opens
  → check authStore for existing token
  → if no token: call POST /auth/guest → store token
  → useTheme()      → fetch theme → injectTheme() → :root variables set
  → useAppConfig()  → fetch product config
  → useNavigation() → fetch nav for current user role
  → render AppShell with nav items
  → route to current page
```

### API Client Rules
- Every API call lives in `src/api/` — never inline in components
- Interceptor attaches JWT to every request automatically
- On 401 → auto-refresh → retry original request
- On refresh failure → clear authStore → redirect to AuthPage

### Component Rules
- No component fetches data directly — hooks only
- No component checks user roles — backend controls via navigation
- No hardcoded colors, sizes, fonts — Tailwind + CSS variables only
- All user-facing text comes from API — supports multilingual

---

## 13. User Screens Per Role

### Guest
- Welcome / Intro
- Voice note recording (optional)
- Questions (full form)
- Summary view
- Share summary (WhatsApp / copy link)

### Registered Free (everything guest has plus)
- History (past sessions)
- Account profile
- Language preference

### Paid (everything registered has plus)
- PDF export
- Multilingual summary
- Priority AI badge

Backend controls which nav items each role sees.
Frontend renders what it receives. Nothing more.

---

## 14. Local Development Setup

### Prerequisites
- .NET 10 SDK
- SQL Server Express (local)
- Node.js 20+
- VS Code with C# Dev Kit extension
- Git

### CoreBackend — appsettings.json
```json
{
  "ConnectionStrings": {
    "CoreBackendDb": "Server=localhost;Database=CoreBackend;Trusted_Connection=true;TrustServerCertificate=true;"
  },
  "Jwt": {
    "Key": "your-secret-key-minimum-32-characters-long",
    "Issuer": "corebackend",
    "Audience": "tellcore-clients",
    "AccessTokenExpiryMinutes": 60,
    "RefreshTokenExpiryDays": 30
  },
  "Google": {
    "ClientId": "your-google-oauth-client-id"
  },
  "Storage": {
    "Provider": "local",
    "LocalPath": "uploads"
  },
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:5174"
    ]
  }
}
```

AI keys are NOT in appsettings.json — Settings table only.

### Frontend — .env.local
```
# predoc
VITE_API_BASE_URL=https://localhost:7001/api/v1
VITE_PRODUCT_SLUG=predoc
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# theuntold (same keys, different slug)
VITE_API_BASE_URL=https://localhost:7001/api/v1
VITE_PRODUCT_SLUG=theuntold
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### Local Ports
| App | Port |
|---|---|
| CoreBackend API | https://localhost:7001 |
| PreDoc frontend | http://localhost:5173 |
| TheUntold frontend | http://localhost:5174 |

### Database Setup Order
```
1. CREATE DATABASE CoreBackend
2. Run 001_Products.sql through 021_AuditLogs.sql in order
3. Run 099_Seed.sql
4. Verify: SELECT * FROM Products
5. Verify: SELECT * FROM Settings
```

---

## 15. Build Order for Agent

Follow this exact sequence.
Do not skip ahead.
Do not start Phase 2 until Phase 1 works end-to-end locally.

### Phase 0 — Project Creation
```
✅ 1.  Create TellCore root folder + git init
✅ 2.  Create .gitignore
✅ 3.  Create folder structure
✅ 4.  Create CoreBackend solution + 5 projects
✅ 5.  Add all project references
✅ 6.  Add all NuGet packages
✅ 7.  Create PreDoc Vite React app + install all packages
✅ 8.  Create TheUntold Vite React app + install all packages
✅ 9.  First git commit — "chore: initial monorepo structure"
```

### Phase 1 — CoreBackend (single project — Controller → Service → Repository)
```
✅ 10. Models/Entities — all C# entity classes with audit fields
✅ 11. Models/Requests + Models/Responses — all DTOs
✅ 12. DbConnectionFactory — IDbConnectionFactory interface + Dapper implementation
✅ 13. All SQL table scripts (001–021) — written; run and verify in SQL Server when local instance available
✅ 14. Seed SQL script (099) — written with PreDoc + TheUntold seed; idempotent
✅ 15. SettingsRepository (interface + class)
✅ 16. ProductRepository (interface + class)
✅ 17. JwtService (interface + class)
✅ 18. Auth — UserRepository + Guest token flow
✅ 19. Auth — Google OAuth (GoogleAuthService)
✅ 20. Auth — Refresh token (implemented in AuthService.RefreshAsync)
✅ 21. AuthController — all 4 endpoints
✅ 22. NavigationRepository + NavigationController
✅ 23. ThemeRepository + ThemesController
✅ 24. FormSetRepository + FormsController
✅ 25. SessionRepository + SessionsController
✅ 26. LocalFileStorageService + voice note upload endpoint
✅ 27. AnswerRepository
✅ 28. SummaryFormatterService (rule-based, no AI)
✅ 29. NullAiSummaryService
✅ 30. GroqAiSummaryService + voice transcription
✅ 31. SubmitResponse — full pipeline (ResponseService orchestrates: answers → AI summary → rule-based fallback → persist)
✅ 32. SummaryRepository + ResponsesController
✅ 33. ConfigController + UsersController + SettingsController (non-secret only)
✅ 34. ExceptionMiddleware
✅ 35. DI wiring in Program.cs — Serilog, JWT auth, CORS, OpenAPI, Scalar, static files for /uploads, ExceptionMiddleware
    Test: 18 endpoints discovered in OpenAPI / Scalar at /scalar/v1. Pipeline reaches SQL layer cleanly (verified via auth probe — fails at TCP 10061 because local SQL Server is not running on this Mac; expected).
```

### Phase 2 — PreDoc Frontend
```
✅ 38. tailwind.config.ts with CSS variable mapping
✅ 39. contracts.ts — TypeScript types matching CoreBackend Models/Responses
✅ 40. api/client.ts — Axios + JWT interceptor + auto-refresh
✅ 41. All api/*.ts files (auth, config, themes, navigation, forms, sessions, responses, users)
✅ 42. authStore.ts + sessionStore.ts (Zustand)
✅ 43. injectTheme.ts
✅ 44. useTheme hook
✅ 45. useAppConfig hook
✅ 46. useNavigation hook
✅ 47. App.tsx — startup sequence + router (main.tsx provides QueryClient + BrowserRouter)
✅ 48. AppShell + NavBar — renders from navigation API
✅ 49. Guest auto-creation on first load (useGuestAuth)
✅ 50. AuthPage — Google OAuth (GIS script in index.html)
✅ 51. IntroPage — intro text + audio player + language selector
✅ 52. VoiceRecorder component
✅ 53. ConditionEngine.ts
✅ 54. All question type components (textarea, textinput, chips, radio, checkbox, bodymap, slider, datepicker, infoblock)
✅ 55. QuestionRenderer.tsx
✅ 56. QuestionsPage — full form flow + progress bar
✅ 57. SummaryView component
✅ 58. PdfExport component (@react-pdf/renderer)
✅ 59. SummaryPage (share via Web Share / clipboard, PDF gated by nav API)
✅ 60. HistoryPage (registered users only, filtered client-side)
    Test: `npm run build` succeeds clean; `npm run dev` serves /index.html (PreDoc title, GIS script, /src/main.tsx entry) on http://localhost:5180. Full end-to-end runtime journey still requires running SQL Server + CoreBackend API locally (developer to verify on Windows machine).
```

### Phase 3 — TheUntold Frontend
```
✅ 61. Seed SQL — `Scripts/100_TheUntold_Seed.sql` adds: warm-paper theme matching THEUNTOLD_DESIGN.md §3, full nav (home/today/stories/featured/profile/notifs/vault per role), daily-prompt FormSet with intro + story_text/tags questions, summary template. Idempotent; deactivates the placeholder warm-sepia theme from 099.
✅ 62. apps/theuntold scaffolded — tailwind config maps `font-display`/`font-handwritten`/`accent`, Lora + Caveat + Nunito loaded, index.html branded, vite default port 5174, env.local set to theuntold slug. Shared infra ported from PreDoc (api client w/ JWT refresh, Zustand authStore + draftStore, theme/config/nav/guest hooks, contracts).
✅ 63. PreDoc structure adapted + TheUntold-specific UI built per design:
    - UI primitives: Button (primary/secondary/ghost/**gold**), FAB (mobile center / desktop corner), Spinner, EmptyState, Toast, ConfirmationModal, Logo, Avatar, Tag.
    - Layout: TopBar (minimal — logo + notification bell w/ unread badge), DesktopSideNav + MobileBottomNav (FAB sits between halves of the tab bar), AppShell.
    - Stories: StoryCard with `compact`/`featured`/`editorial` variants, AudioStoryPlayer (warm waveform + speed control), StoryReader (drop-cap serif prose), MemoryCard (shareable visual).
    - Profile: StreakCounter (ring intensity scales 1–6/7+/30+/100+, gold ring at 100), MilestoneBadge, StatTile.
    - Writing: VoiceRecorder (warm pulse, font-display timer), TextEditor (auto-grow, auto-save every 3s, word + char count).
    - Data layer: `data/storyFixtures.ts` + `api/stories.api.ts` stub for Stories/Streak/Featured/Notifications/Family/Capsules — same shapes as the eventual backend, swap is one file.
    - All 14 pages: SplashScreen, OnboardingPage (3 steps), AuthPage, DashboardPage, TodayPromptPage, VoiceRecordingPage, WriteStoryPage, MyStoriesPage, StoryDetailPage, FeaturedFeedPage, StoryOfTheDayPage, ProfilePage, FamilyVaultPage, NotificationsPage.
    - App.tsx routes everything; onboarding gates first-time users; full-bleed write/voice/onboarding/SOTD pages opt out of AppShell.
✅ 64. `npm run build` clean (1890 modules, 386 kB JS). Dev server serves /index.html on http://localhost:5184 with `<title>TheUntold</title>` and meta theme-color `#c08552`. Full runtime end-to-end requires SQL Server + CoreBackend; community-side endpoints (Stories/Streaks/Featured) require backend extensions beyond Phase 1.
```

### Phase 4 — Polish
```
65. Error handling + loading states everywhere
66. Mobile responsive audit and fixes
67. PWA manifest + service worker
68. SEO meta tags
69. Accessibility audit
70. Performance audit
```

---

## 16. What Agent Must Never Do

- Never use Entity Framework or any ORM — Dapper and raw SQL only
- Never hardcode any color, font, size, or spacing in frontend
- Never hardcode navigation items in frontend
- Never hardcode question content in frontend
- Never check user roles in frontend — backend controls this
- Never put AI API keys in appsettings.json — Settings table only
- Never return IsSecret = true settings to frontend
- Never skip audit columns on any table
- Never hard delete — always soft delete (IsDeleted = 1)
- Never start Phase 2 before Phase 1 is working end-to-end
- Never create a new architectural pattern without checking this document
- Never add a package not listed in this document without asking first
- Never inline API calls inside React components

---

## 17. Key Concepts — Quick Reference

| Concept | Rule |
|---|---|
| Backend drives everything | Content, nav, theme, settings — all from CoreBackend |
| Frontend is a renderer | Receives data, renders it, generates PDF |
| Dapper only | All SQL handwritten in repository layer |
| Settings table | All config here — feature flags, AI keys, everything |
| Soft delete | IsDeleted flag — never physically remove rows |
| Audit columns | Every table — no exceptions |
| AI is swappable | Interface + Settings table controls provider |
| Guest first | Full app works without login — zero friction |
| Monorepo | One repo — CoreBackend + PreDoc + TheUntold |
| Build in order | Each phase complete before next phase starts |
| Local first | Everything runs locally before any hosting decisions |

---

*Document version: 2.1*
*Project: TellCore Platform*
*Developer: Niranjan*
*Agent instruction: Read this document fully at the start of every session before writing any code.*

---

## 18. Session Notes

### 2026-05-10
- ~~ASP.NET Core Web API — .NET 9~~ → .NET 10 (updated 2026-05-10: developer confirmed .NET 10 SDK 10.0.103)
- Working directory is `d:\ProjectN` — this IS the TellCore root (no nested TellCore folder needed)
- .NET SDK 10.0.103 confirmed working; all projects target net10.0
- Tailwind v4 (4.3.0) installed by default — downgraded to v3 (3.4.19) to match PROJECT_MEMORY config pattern (theme.extend with CSS variables requires v3 style)
- `npx tailwindcss init -p` only works with v3; use `tailwindcss@3` explicitly when creating new frontend apps
- Confirmed NuGet package versions installed:
  - Microsoft.AspNetCore.OpenApi 10.0.7
  - Scalar.AspNetCore 2.14.11
  - Serilog.AspNetCore 10.0.0
  - Serilog.Sinks.Console 6.1.1
  - Microsoft.AspNetCore.Authentication.JwtBearer 10.0.7
  - FluentValidation.AspNetCore 11.3.1
  - MediatR 14.1.0
  - FluentValidation 12.1.1
  - FluentValidation.DependencyInjectionExtensions 12.1.1
  - Microsoft.Extensions.Logging.Abstractions 10.0.7
  - Dapper 2.1.72
  - Microsoft.Data.SqlClient 7.0.1
  - BCrypt.Net-Next 4.1.0
  - Microsoft.Extensions.Configuration.Abstractions 10.0.7
  - Microsoft.Extensions.Http 10.0.7
- Confirmed npm package versions installed (predoc + theuntold same):
  - tailwindcss 3.4.19
  - @tanstack/react-query ^5.100.9
  - zustand ^5.0.13
  - react-router-dom ^7.15.0
  - axios ^1.16.0
  - @react-pdf/renderer ^4.5.1
  - lucide-react ^1.14.0
- `dotnet new webapi` requires `--use-controllers` flag to get traditional controller-based project (not minimal API)
- Phase 0 complete. Ready to start Phase 1 Step 10: Domain entities

### 2026-05-11
- ~~5-project Clean Architecture~~ → single project (updated 2026-05-11: developer preference — simpler Controller → Service → Repository pattern)
- Removed: CoreBackend.Application, CoreBackend.Domain, CoreBackend.Infrastructure, CoreBackend.Contracts projects
- Single project is CoreBackend.API — all packages consolidated there
- Folder structure: Controllers/, Models/Entities/, Models/Requests/, Models/Responses/, Services/Interfaces/, Repositories/Interfaces/, Middleware/, Scripts/
- No MediatR — direct service calls from controllers
- Build Order Phase 1 rewritten to match new structure (steps 10–35)
- Phase 1 (Steps 10–35) complete. All 18 endpoints from Section 11 wired and discoverable via OpenAPI/Scalar at `/scalar/v1`.
- AI provider switching: `IAiSummaryService` and `IVoiceTranscriptionService` resolved at request time from `Settings.ai.provider`. Set to `null` (default) → uses Null services; set to `groq` → uses Groq services. Zero-code swap.
- Groq services read API key from `Settings.ai.groq.apikey` (IsSecret=true) — never from appsettings.json.
- SQL Server is not available locally on macOS (this dev machine). Run the SQL scripts when on Windows with SQL Server: bin/Debug/net10.0/Scripts/001_*.sql..099_Seed.sql in order. The .sql files are copied to output on build.
- Scripts ship copied to API output via `<None Update="Scripts\*.sql" CopyToOutputDirectory>` in csproj.
- launchSettings.json default URL: http://localhost:5106 (http profile) and https://localhost:7027 (https profile).
- ExceptionMiddleware returns `application/problem+json`; pattern verified end-to-end via auth probe.

### 2026-05-12
- Phase 2 (Steps 38–60) complete. PreDoc frontend built per PREDOC_DESIGN.md; one bundled commit per developer preference.
- Folder layout under `apps/predoc/src/`: `api/`, `components/{ui,layout,questions,summary,voice}/`, `hooks/`, `store/`, `theme/`, `types/`, `pages/`.
- Theme system: CSS variables seeded in `index.css` as a baseline (`--primary` calm green #1d9e75 etc.) and overridden at runtime by `injectTheme()` once `GET /products/predoc/themes/active` responds — backend remains source of truth.
- Tailwind v3 config maps `bg-primary`, `text-text-primary`, `rounded-md`, `border` (DEFAULT), `font-body`, etc. directly to `var(--*)`. No hardcoded colors in components.
- Auth: `authStore` is persisted via Zustand `persist` (localStorage key `predoc.auth`); guest `deviceToken` is a UUID kept in `predoc.deviceToken`. `useGuestAuth` auto-creates a guest session on first load when no access token is present.
- Axios client in `api/client.ts` injects `Authorization: Bearer ...` and runs a single-flight refresh on 401 via `/auth/refresh`; concurrent in-flight requests queue on the refresh promise. Refresh failure clears auth.
- React Query is the only data-fetching layer; components never call axios directly. Hooks: `useTheme`, `useAppConfig`, `useNavigation`, `useDefaultFormSet`, `useGuestAuth`.
- Routing in `App.tsx`: `/` IntroPage, `/voice` VoiceNotePage, `/questions` QuestionsPage (full-bleed, own progress bar), `/summary/:sessionId` SummaryPage, `/history` HistoryPage, `/auth` AuthPage. Splash is rendered while theme/config load.
- Question registry in `QuestionRenderer.tsx` maps backend `question.type` → component for: textarea, textinput, chips, radio, checkbox, bodymap (front/back SVG with tappable regions), slider (1–10 with optional emoji indicators), datepicker, infoblock. `ConditionEngine.shouldShowQuestion` evaluates `in / not_in / equals / not_equals` conditions and supports array-valued answers.
- PDF export uses `@react-pdf/renderer` with built-in Helvetica fonts so it works offline (avoids font-fetching). Triggered from SummaryPage only when navigation API returns an `export`/`pdf`/`paid` item — frontend never role-checks.
- Share button uses `navigator.share` when available, falls back to clipboard.
- Voice recorder uses `MediaRecorder` with `audio/webm` preferred, `audio/mp4` fallback for Safari; uploads via `POST /sessions/{id}/voice` as multipart.
- Build verified: `npm install` (306 packages), `npm run build` clean. Dev server on `http://localhost:5180` returns the PreDoc index with title `PreDoc`, GIS script, and `/src/main.tsx` entry.
- Phase 2 not runtime-tested end-to-end yet — local Mac has no SQL Server / CoreBackend running; developer to verify the full guest journey on Windows (Steps 56→submit→SummaryPage).
- `.env.local` for predoc set to `VITE_API_BASE_URL=https://localhost:7027/api/v1` to match backend launchSettings HTTPS profile.
- ESLint config not generated by the original Vite scaffold (`eslint .` errors with "couldn't find eslint.config.js"); not required for Phase 2 completion — left as a Phase 4 polish item.
- TheUntold deliberately not started — waiting on developer confirmation per task instructions.

### 2026-05-12 (Phase 3)
- Phase 3 (Steps 61–64) complete. TheUntold frontend built per THEUNTOLD_DESIGN.md; one bundled commit per developer preference. Polish phase not started — waiting for developer confirmation.
- Visual identity intentionally differs from PreDoc: paper-cream `--surface` (never pure white), warm terracotta `--primary` `#c08552`, gold `--accent` `#d4a574` for featured/story-of-day, three fonts (Lora display, Nunito body, Caveat handwritten), paper-grain SVG overlay on emotional cards, ink-fade-in entrance animation.
- Story typography: `.story-prose` class gives 19px Lora at 1.75 line-height with a primary-dark drop-cap on the first letter of the first paragraph. Used in StoryReader + StoryOfTheDayPage.
- Backend gap is explicit: CoreBackend does not yet expose Stories / Streaks / Featured / Family / Notifications. `apps/theuntold/src/data/storyFixtures.ts` provides realistic data; `api/stories.api.ts` calls it via `setTimeout` to mimic latency. Replace these two files (no other component changes) when the backend ships those endpoints.
- What IS wired to the live backend: `/auth/guest`, `/auth/google`, `/auth/refresh`, `/users/me`, `/products/theuntold/config`, `/products/theuntold/themes/active`, `/products/theuntold/navigation`, `/products/theuntold/forms/default` (powers the daily prompt text + tag options on the write screen). `/sessions` + `/sessions/{id}/voice` are imported but currently bypassed in favour of local-draft saves — re-enable when the Stories pipeline exists.
- Onboarding is a one-time gate stored on `authStore.onboardingComplete`; users can `Skip` (still marks complete) so guests aren't punished.
- Mobile nav layout: `today` nav key becomes the FAB; `notifs` and `vault` are excluded from the 5-column bottom bar (they live in TopBar / desktop side rail). FAB and bottom nav are mobile-only via `md:hidden` wrappers.
- Draft state: `draftStore` (Zustand + persist) holds prompt key + kind + text + tags + audio blob URL + lastSavedAt. WriteStoryPage auto-saves the text every 3s; VoiceRecordingPage saves the blob URL + duration. On "Save story" both pages clear the draft and toast.
- Voice recorder is intentionally different from PreDoc's: 32×32 circular button using `animate-warm-pulse` (warm orange glow, not green), serif/font-display timer, handwritten "Speak freely. We'll listen." line. Falls back to `audio/mp4` on Safari.
- StreakCounter is purely SVG (no canvas); ring intensity tiers `<7` grey, `7–29` green, `30–99` thicker primary, `100+` adds `animate-warm-glow` with the `--accent` gold ring. Never shames the user — no broken-streak UI exists.
- PDF export is NOT included for TheUntold (per design — stories aren't doctor handouts). Share uses Web Share API with clipboard fallback.
- Vite dev server pinned to port 5174 (matches backend CORS allowlist alongside PreDoc on 5173). Build size: 386 kB JS / 22 kB CSS — no @react-pdf/renderer bundled.
- Seed script `100_TheUntold_Seed.sql` runs AFTER `099_Seed.sql`. It explicitly UPDATEs `Themes` (sets warm-sepia inactive/non-default, warm-paper active/default) and soft-deletes the placeholder `home`/`history` nav rows before inserting the full TheUntold nav. Idempotent on re-run. Verify on Windows when SQL Server is available.

### 2026-05-16 — Redesign branch `redesign/welcome-and-motion-v2`
- New Git branch off master with both apps' initial frontends committed. Work is unmerged; developer to review and merge.
- **Removed auto-guest-on-first-load** for both apps. Previously `useGuestAuth` auto-created a guest token; now both `App.tsx` files render a Welcome route while `accessToken` is null, and only an explicit user click creates the session.
- **PreDoc** new entry route is `/welcome`; the main flow starts at `/start` (was `/`). `/` and unknown routes redirect to `/start` once authenticated.
- **TheUntold** keeps `/` as the dashboard but gates it behind Welcome → (optional) Onboarding. Onboarding still uses `authStore.onboardingComplete`; the App.tsx now strictly routes-to-onboarding when that flag is false instead of returning bare components.
- Added shared motion vocabulary in each app (kept in `src/index.css`):
  - `@keyframes word-rise` + `.animate-word-rise` — words slide up from under a clip mask. Component: `WordReveal` renders any string as per-word reveal with stagger + initial delay.
  - `mesh-aurora` / `mesh-breath` (PreDoc) and `mesh-warm` (TheUntold) — multi-radial gradients that drift slowly via `mesh-drift` keyframe; blurred and saturated. Component: `MeshBackground` for PreDoc.
  - `glass-card` (PreDoc) and `editorial-card` (TheUntold) — frosted panels with backdrop-filter, soft elevation, and tinted shadow. Used for the welcome auth cards and the IntroPage CTA card.
  - `animate-ring-breathe` / `animate-candle-flicker` / `animate-ink-bleed` / `hand-draw` — subtle health/editorial motifs.
  - `.bg-noise` — inline SVG turbulence overlay for paper grain; ~6% opacity.
  - `btn-shimmer` — pseudo-element shimmer pass over primary CTAs.
- `useMagnetic<T>(strength)` hook (both apps) — cursor-follow translate on desktop only. Disabled when `(pointer: coarse)` OR `prefers-reduced-motion: reduce` matches. Used on the primary auth CTA and the dashboard "Tell this story" button.
- **PreDoc WelcomePage** — two-column hero on md+; left side is editorial typography with three `WordReveal` lines ("You know" / "something is wrong." / "We help you explain it." in primary-dark), right side is a `glass-card` with breathing ring corner accent, Google CTA + guest CTA. Trust strip at footer in uppercase letter-spaced caps. Single-source `declare global Window.google` lives in `AuthPage.tsx` only — WelcomePage relies on the merged ambient type.
- **TheUntold WelcomePage** — magazine cover. Huge `font-display` headline with italic middle line ("Every life / has a story / worth keeping."). Rotating editorial quote (6.5 s interval) pulled from `storyFixtures` — `featuredStory` + first 3 `recentStoriesFixtures`. `editorial-card` paper auth panel with gold-accent primary "Continue with Google" + ghost "Continue as guest", a rotated "Daily Page" stamp top-right, and an SVG hand-drawn underline that strokes in on mount.
- **PreDoc IntroPage** modernised — wrapped in `MeshBackground variant="breath"`, glass card panel with breathing-ring corner, title rendered via `WordReveal`, primary CTA gets an `ArrowRight` trailing icon. Existing language selector, voice-note button, and trust strip kept.
- **TheUntold DashboardPage** hero — greeting becomes a two-line `WordReveal` ("{greeting}," then italic `{firstName}.` in primary-dark), today's prompt card now layers `mesh-warm` + paper grain for depth, prompt question itself uses `WordReveal`, primary CTA is magnetic with pen icon + arrow.
- Build verified: PreDoc `1795 kB JS / 19 kB CSS`, TheUntold `397 kB JS / 27 kB CSS`. Dev servers serve correct titles + theme-color metas on ports 5180 (PreDoc) and 5184 (TheUntold).
- Scope intentionally limited this session: only Welcome screens + two hero screens redesigned. Other 20+ screens still use the prior look; can be iterated next session once developer shares motionsites.ai-style sample references they mentioned.
- No new dependencies added — all motion is pure CSS keyframes + tiny vanilla hooks. CLAUDE.md package gate respected.

### 2026-05-16 (later) — Full redesign pass across every screen
Same branch `redesign/welcome-and-motion-v2`. Research-driven sweep based on 2026 web design trends:
- Healthcare UX: calm whitespace, gentle micro-interactions as *communication* not decoration (per Eleken / FuselabCreative / Excellent Web World 2026 trend pieces).
- Editorial/memoir aesthetic: tactile rebellion, paper grain, postal ephemera, drop-cap serifs (Creative Bloq / Fontfabric / Letterhend 2026 typography reports).
- Motion patterns: CSS `animation-timeline: view()` and `animation-timeline: scroll(root)` are universal in 2026; replace JS scroll observers (per Codrops / DEV community 2026 articles).

**New shared motion vocabulary (added to both apps' index.css):**
- `@keyframes rise-in`, `slide-in-left`, `scale-in` + matching `.reveal`, `.reveal-left`, `.reveal-scale` classes wrapped in `@supports (animation-timeline: view())` with a one-shot mount fallback for older browsers.
- `[data-stagger] > *` selector uses CSS custom property `--i` to stagger child animations.
- `.lift` hover that translates up and adds a tinted shadow on desktop only.
- `.grad-border` — masked gradient border using `mask-composite: exclude`.
- `.animate-tick`, `.animate-caret`, `.animate-page` (page transition with blur).
- `.dot-pulse` (PreDoc) for active-state dots.

**Shared components added:**
- `ScrollReveal` (both apps) — wraps any element with the CSS reveal classes; accepts `variant`, `index`, `delay`.
- `StatCounter` (both apps) — rAF-driven number tick from 0 → value with easeOutCubic.
- `PaperEphemera.tsx` (TheUntold only) — `Tape`, `Stamp`, `Postmark` SVG components for the editorial diary aesthetic.

**TheUntold-specific additions:**
- `.tape`, `.stamp`, `.postcard`, `.handline` (squiggly hand-drawn underline SVG used inline on key headlines) tactile primitives.
- `.read-progress` — fixed top bar driven by `animation-timeline: scroll(root)` for story reading progress. Used on StoryDetailPage + StoryOfTheDayPage.

**PreDoc — every screen redesigned:**
- AuthPage: now wrapped in `MeshBackground variant="breath"`, glass card with breathing-ring corner, primary "Continue with Google" CTA, harmonized with Welcome.
- QuestionsPage: full-bleed mesh background, circular SVG progress ring + step counter in a pill at top, glass card around each question, `animate-page` transition between questions.
- SummaryPage + SummaryView: complete rewrite to feel like a medical letter — gradient letterhead band at top, monospace tracking-wider section numbers, SVG noise overlay for paper texture, sections scroll-reveal staggered, signature footer.
- HistoryPage: timeline list with left vertical rail and ringed dots per entry, lift-on-hover entries, gradient border, scroll-reveal staggered.
- VoiceNotePage: now wrapped in mesh + glass card, with kicker "Step 1 of 2 · Voice" and editorial headline above the recorder.

**TheUntold — every screen redesigned:**
- SplashScreen: warm mesh + paper grain + noise, animated flame on the feather, ink-bleed-in for the wordmark, three loader dots tick-cycling at the bottom.
- OnboardingPage: per-step `animate-ink-bleed`, decorative concentric/dashed circles around each illustration, "Chapter NN" handwritten kicker, `handline` underline on headlines.
- AuthPage: editorial-card with washi tape strip at top, gold variant primary CTA, handline-underlined handwritten tagline.
- TodayPromptPage: dramatic full-bleed mesh + paper, prompt as word-revealed huge serif, Postmark SVG component below header, two postcard choice cards with stamps ("Voice" / "Pen") and magnetic hover.
- VoiceRecordingPage: mesh background + ambient paper grain wrapping the existing warm-pulse recorder.
- WriteStoryPage: ruled-notebook background (repeating linear-gradient stripes at 36px), pill-shaped saved indicator, sticky footer with handwritten encouragement.
- MyStoriesPage: editorial header with handwritten kicker + `StatCounter` for total stories, `grad-border` search pill, scroll-reveal staggered list/grid, lift-on-hover cards.
- StoryDetailPage: top `read-progress` scroll-driven bar added (animates from 0% to 100% as the user scrolls).
- FeaturedFeedPage: handwritten kicker "On the community page", postcard empty-state, hero scale-reveal, staggered editorial grid.
- StoryOfTheDayPage: hero bar now layers `mesh-warm` + paper grain, `read-progress` bar added.
- ProfilePage: avatar lives inside a `postcard` with `Tape` strip across the top and a `Postmark` SVG in the corner; stats reveal with stagger; milestones become a left-rail timeline like PreDoc's history.
- FamilyVaultPage: postcard header with "Vault" stamp, time-capsule items get "Locked" stamps + warm-glow shield, member rows lift on hover.
- NotificationsPage: editorial header with unread count, staggered reveal, postcard empty state.

**Build verification:**
- PreDoc: 24.80 kB CSS / 1800 kB JS (gzip 596 kB). The big JS is `@react-pdf/renderer`; rest of motion is CSS.
- TheUntold: 32.54 kB CSS / 407.58 kB JS (gzip 124.86 kB).
- No new npm packages. CLAUDE.md package gate respected.
- All motion respects `prefers-reduced-motion: reduce` via a global `*` override at the bottom of each app's index.css.

**Browser support:** Scroll-driven animations (`animation-timeline: view()` / `scroll()`) are universal in 2026 evergreen browsers per the W3C Scroll-Driven Animations spec. The `@supports` guards still ship a graceful one-shot fallback for older versions.

**Still pending — for next session if developer wants:**
- Page-transition orchestration between routes (currently `animate-page` is per-page mount only, not a true link-driven transition).
- View Transitions API for browsers that support it.
- Code splitting / lazy routes to address the >500 kB PreDoc JS warning (driven by @react-pdf/renderer being eagerly imported in SummaryPage).
- Hand-illustrated SVG decorations beyond the current generic icons.

### 2026-08-31 — TheUntold v1 sprint kickoff (branch `feature/untold-v1`)
Developer returned after ~3.5 months. Focus: **TheUntold first**, 3-day sprint to a demo-able global MVP.
Detailed sprint plan lives in **`docs/PLAN.md`** (new living document — read it alongside this file; checkboxes there track sprint progress). Decisions confirmed by developer:

- **Reuse existing work** — no rebuild. Backend Phase 1 + TheUntold frontend (Phase 3 + redesign) are the base.
- **New branch per sprint**: `feature/untold-v1` created off `redesign/welcome-and-motion-v2`; merge to `master` when sprint completes.
- **Mobile apps via Capacitor** (NOT Blazor Hybrid) wrapping the existing Vite React app. App id `com.tellcore.theuntold`. Capacitor packages approved.
- **Payments: Stripe, global** (not Razorpay — audience is worldwide). Test mode for demo. `Stripe.net` NuGet package approved (webhook signature verification). Apple IAP compliance deferred until iOS App Store release.
- **Paid model: premium membership** — free users write stories + read ~600-char previews of public stories; paid unlocks full public stories, multilingual AI, audio playback, family vault, unlimited stories. Gating stays 100% backend-driven (navigation + preview logic).
- **AI moderation is mandatory** before any story goes public — pipeline flags unsafe content/PII; flagged stories stay private with reason shown to author.
- **Family vault invites via secure share links** (token URL, 7-day expiry) — no email service in MVP.
- **Languages: English UI + any-language story input** — AI transcribes, keeps original language, translates to English. Full UI i18n post-MVP.
- **SQL Server 2022 → 2025** (Docker `mssql/server:2025-latest`): local SQL Server now runs in Docker ON THIS MAC (port 1433 confirmed open — supersedes 2026-05-11 note that SQL Server was unavailable on macOS). 2025 gives native `VECTOR(n)` + `VECTOR_DISTANCE` for semantic search; Azure SQL free tier (planned prod DB) supports the same, so search SQL is portable. Local DB will be dropped + recreated fresh: scripts 001–021, 099, 100, then new 101–113 (Stories, StoryTranslations, StoryTags, StoryEmbeddings, StoryViews, Streaks, FamilyMembers, VaultInvites, Notifications, Subscriptions, PaymentEvents, FeaturedStories, Users alter).
- **New Python AI service** at `services/ai/` — FastAPI + LangGraph, internal-only (called by .NET with shared secret header; frontends never call it). Pipeline: transcribe (Groq Whisper) → detect language → clean → moderate → translate(en) → tag → embed (`intfloat/multilingual-e5-small`, 384-dim, local CPU model — free, offline, multilingual). Documented deviation: the "AI keys in Settings table" rule governs .NET; the Python service reads its Groq key from env vars (standard per-service secret ownership).
- **Voice/media storage rule**: raw audio files go to file storage (local `uploads/` now → Cloudflare R2 free tier when hosted), NEVER into SQL. Transcript/translation/embedding rows go to SQL.
- **Hosting (demo, free tier)**: web → Cloudflare Pages/Vercel; CoreBackend → Azure App Service F1 or Render (container); AI service → Hugging Face Space; DB → Azure SQL free tier; audio → R2. CI via GitHub Actions with monorepo path filters. Azure-leaning because developer plans Azure/AWS after traction.
- **Scale posture**: developer aspires to very large scale eventually ("10 crore users"). Agreed approach: do NOT build for that now; keep scale-unblocking habits (stateless JWT API, media in object storage, async AI with status polling, cache-friendly GETs, rate limiting + security headers from day one). Redis/queue/CDN/partitioning are post-traction backlog.
- Toolchain verified on this Mac: .NET SDK 10.0.203, Node v24.14.1, system Python 3.9.6 (AI service will use Python 3.12 via `uv`).

### 2026-09-01 — Day 1 complete (backend + frontend swap)
- **SQL Server 2025 live**: container `sqlserver2025` (mcr 2025-latest RTM-CU8, amd64 under Rosetta), volume `tellcore-sql2025-data`, SA password same as old 2022 container. Old `sqlserver` (2022) container stopped but kept. **Gotcha: sqlcmd needs `-I`** (QUOTED_IDENTIFIER ON) or filtered-index creation fails mid-script.
- CoreBackend DB rebuilt from scratch: 34 tables. New scripts **101–115** (Stories, StoryTranslations, StoryTags, StoryEmbeddings `VECTOR(384)`, StoryViews, Streaks, FamilyMembers, VaultInvites, Notifications, Subscriptions, PaymentEvents, FeaturedStories, Users.IsProfilePublic alter, settings seed, StoryHearts). `VECTOR_DISTANCE('cosine', ...)` verified working.
- **appsettings.Development.json** (gitignored) holds the real SQL-auth connection string; committed appsettings.json keeps the placeholder. `.env.local` points to `http://localhost:5106/api/v1` (http launch profile) on this Mac.
- Backend patterns kept: Controller → Service → Repository; new `AuthorizedControllerBase` gives GetUserId/GetUserType/ErrorResult (service error-code strings → HTTP). Services return `(result, errorCode)` tuples — codes: not_found, forbidden, story_limit_reached, invalid_*, invite_*, billing_not_configured.
- **Story lifecycle**: Status draft → processing → published | flagged; Visibility private | family | community (matches frontend union exactly). POST /stories/{id}/process enqueues to an in-process channel; StoryProcessingWorker (BackgroundService) calls the FastAPI pipeline via AiPipelineClient. **Fallback when pipeline absent**: publishes raw text, but a community story is downgraded to private with reason "AI review was unavailable…" — unmoderated content never goes public. Verified live.
- **Preview gating server-side**: non-paid viewers of community stories get body truncated to `stories.preview.chars` (600) + audioUrl nulled, `isPreview: true`. Owner/family/paid get full. Free users capped at `stories.free.storylimit` (10) stories.
- **Stripe**: Stripe.net 52.4.0; checkout session (ClientReferenceId = userId, metadata on subscription too); webhook idempotent via PaymentEvents.StripeEventId unique; period end read from `sub.Items.Data[0].CurrentPeriodEnd` (new Stripe API shape). Settings keys payments.stripe.* are placeholders until developer provides test keys.
- **Frontend swap done in one file** as designed: `stories.api.ts` now calls the real API with unchanged fetch* signatures. `fetchFeaturedStory` returns `Story | null` (404 → null → pages show empty states). New exports: createStory/uploadStoryVoice/processStory/searchStories/toggleStoryHeart/recordStoryView/vault + notification + billing calls. Story type extended with optional isPreview/isMine/status/viewCount/hasHearted/moderationReason.
- Write/Voice pages now really save: createStory → (voice: upload blob) → processStory → invalidate my-stories + streak. `VisibilityPicker` (Just me / Family / Everyone) added to both, backed by draftStore.visibility (default private). story_limit_reached surfaces as an upgrade toast.
- StoryDetailPage: records views (deduped per user/day server-side), heart toggle, real delete (owner only), preview card linking to `/upgrade` (route to be built Day 2 with billing UI).
- Smoke tests green: guest auth → text story → process → fallback publish; voice story → multipart upload to /uploads → published(family). Frontend `npm run build` clean (410 kB JS).
- **Day 2 next**: services/ai FastAPI + LangGraph, real moderation/translation/embeddings, /upgrade page + Stripe test-mode end-to-end, semantic search wiring in MyStories search pill.

### 2026-09-01 (later) — Day 2 complete (AI pipeline + payments, ran a day early)
- **services/ai** shipped: FastAPI + LangGraph, Python 3.12 via `uv` (Homebrew; `uv sync` in services/ai). Endpoints: POST /v1/process-story (multipart), POST /v1/embed-query, GET /healthz. Auth = `X-Internal-Secret` header compared with `secrets.compare_digest`; secret lives in Settings (`ai.pipeline.sharedsecret`) and services/ai/.env (gitignored; .env.example committed). Run: `cd services/ai && uv run uvicorn app.main:app --port 8000`.
- **Groq models changed since May** — `llama-3.3-70b-versatile` no longer exists. Current: chat = `openai/gpt-oss-120b`, moderation = `openai/gpt-oss-safeguard-20b` (policy-prompt safety classifier; Llama Guard is gone), whisper = `whisper-large-v3` (still alive). Settings `ai.groq.model` updated. Moderation **fails closed**: guard unavailable/unparseable ⇒ story kept private.
- **Embeddings implementation swap**: fastembed (ONNX, no PyTorch) doesn't carry multilingual-e5-small, so model = `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` — same 384 dims as `VECTOR(384)`. Loaded once at FastAPI startup (~25 s first download, cached after).
- Pipeline design: ONE structured LLM call does language/title/cleanup/excerpt/English-translation/tags/contact-info (fits Groq free-tier 30 rpm), then separate moderation call, then local embeddings. Contact info (phone/email/address) ⇒ flagged.
- **Verified end-to-end**: Telugu text story → detected `te`, Telugu title "అమ్మమ్మ పాట", English translation, published to community; **English semantic query found the Telugu story** (cross-lingual VECTOR search); real speech (macOS `say` wav) → Whisper transcript → AI title "Father's Pocket Notebook" → published; spam story with phone number → `flagged` with friendly reason.
- **Stripe fully wired in test mode** (developer provided sandbox keys 2026-09-01): product `prod_VBB1GNAlVIVewP`, prices `premium-monthly` $4.99 / `premium-yearly` $39 created via API; secret key + price ids + webhook secret all in Settings (values set directly in DB — placeholders remain in committed seed). **Stripe CLI at `~/.local/bin/stripe`** (brew failed — needs newer Xcode CLT; used GitHub binary). Webhook forwarding: `~/.local/bin/stripe listen --api-key <sk> --forward-to http://localhost:5106/api/v1/billing/webhook` (no interactive login needed).
- **India-regulation gotcha**: this Stripe account is India-registered ⇒ export (international) transactions REQUIRE customer name + address ("As per Indian regulations..."). Fixed by `BillingAddressCollection = "required"` on Checkout sessions (hosted Checkout collects it). API-created test subscriptions need name+address set on the customer.
- Webhook handler now also processes `customer.subscription.created` (not just updated/deleted). Full loop verified: subscription invoice paid → webhook → Subscriptions row + `UserType='paid'` → `/auth/refresh` regenerates JWT with paid claim → navigation returns all 7 items (vault included). Incomplete subscriptions correctly do NOT upgrade.
- **Guest-upgrade caveat**: `GetByDeviceTokenAsync` filters `UserType='guest'`, so a paid ex-guest who loses tokens (reinstall) can't re-auth via device token — a NEW guest is created. Paid users should link Google sign-in; surface this in UI post-MVP.
- Frontend additions: `UpgradePage` (/upgrade, plans from API, gold yearly CTA) + `UpgradeSuccessPage` (/upgrade/success — polls billing status then refreshes JWT via new `authRefresh()` so paid nav applies immediately) + `VaultJoinPage` (/vault/join/:token, works signed-out via localStorage pending-invite + InviteGate/PendingInviteRedirect in App.tsx) + vault invite-link UI + shared-stories section on FamilyVaultPage + semantic search box on FeaturedFeedPage (450 ms debounce). Builds clean (424 kB JS).
- Commit scope `ai` added for services/ai (CLAUDE.md scope list predates the service).

### 2026-09-01 (evening) — Frontend coverage audit + demo data
- **Developer preference: NO attribution/Co-Authored-By lines in commit messages** — plain `type(scope): description` only (or just stage and let developer commit).
- Profile page rebuilt into a real account hub: account card (Guest/Free/Premium + email, "Continue with Google" for guests), membership card (plan + renewal date; Upgrade link, or "Manage subscription" → new `POST /billing/portal-session` Stripe customer-portal endpoint), public/private profile toggle (PATCH /users/me/privacy — flips authorship between real name and "A storyteller"), Sign out (POST /auth/logout + authStore.clear + queryClient.clear → /welcome; deviceToken and onboardingComplete survive).
- `UserResponse` now includes `IsProfilePublic` (backend record + TS contract).
- Notifications are clickable: mark-read + navigate to `linkRoute` (contract gained linkRoute).
- StoryCard compact shows own-story chips: Processing (draft/processing), "Needs a change" (flagged), Everyone/Family visibility. StoryDetail shows the flagged moderation reason and a processing notice to the owner.
- **Demo data seeded through the real pipeline** (`scratchpad/seed_demo.py`, run with `uv run python` — system python is 3.9, no `X | None` syntax): Maya Iyer, Thomas Whitfield, Rani Aluri (te), Carmen Delgado (es), Arjun Mehta (hi) — 5 registered users (guest-created then SQL-updated Name/Email/UserType), 7 community stories in 4 languages with AI titles in native script, cross-hearts and views. Feed + story-of-the-day look alive.
- **Google login pending developer input**: `VITE_GOOGLE_CLIENT_ID` (apps/theuntold/.env.local) and `Google.ClientId` (appsettings) are placeholders — create an OAuth 2.0 Web client in Google Cloud Console (authorized JS origins: http://localhost:5174 + prod domain) and drop the client id in both places. Until then only guest login works (expected).
- **Stripe customer portal**: test mode requires the default portal configuration to be saved once in the Stripe dashboard (Settings → Billing → Customer portal → Save changes); until then "Manage subscription" returns 503 `portal_unavailable` gracefully.

### 2026-09-01 (night) — Email/password auth + backend-driven auth methods
- Context: developer's office network SSL-intercepts accounts.google.com (`NET::ERR_CERT_AUTHORITY_INVALID`) — Google sign-in untestable there; will be tested on personal laptop after deploy (add the deployed URL to Google authorized origins then).
- **Email + password auth shipped** (developer decision, "3 options: oauth, jwt, guest"): `POST /auth/register` {email,password,name} and `POST /auth/login` — BCrypt hashes in new `Users.PasswordHash` (script 116_PasswordAuth.sql). Password ≥ 8 chars. Register conflicts: `email_in_use`, `email_uses_google`; login always returns generic `invalid_credentials` (no account-existence leak). Registered users get the standard 1h JWT + 30d refresh.
- **Backend decides which sign-in options frontends show**: Settings `auth.methods` = `["google","password","guest"]` (json), served by anonymous `GET /auth/methods` (AuthService.GetEnabledMethodsAsync). WelcomePage and AuthPage render buttons/form strictly from this list — remove a method from the setting and it disappears from the UI.
- AuthPage is now the full auth hub: email form with Sign in / Create account toggle + Google + guest + GIS fallback button. WelcomePage gained a "Sign in with email" button.
- **Guests can now reach sign-in**: nav seed updated (script 116) — `profile` RequiredRole is `guest`; ProfilePage's guest CTA is "Sign in or create account" → /auth. Sign out also available there.
- Auth endpoints get a tighter rate limit: named policy "auth" (20 req/min/IP) via `[EnableRateLimiting("auth")]` on AuthController, on top of the 300/min global.
- Verified: methods endpoint, register → tokens, case-insensitive email login, wrong-password 401, duplicate 409 email_in_use, weak_password 400; guest nav = home/today/featured/profile.
- Developer runs backend/frontend/AI service in three terminals now; when I rebuild the backend I restart it in my background — developer just reruns `dotnet run` in their terminal when they prefer owning it.

### 2026-09-01 (late night) — Day 3 started: mobile polish + Capacitor (branch `feature/untold-mobile`)
- Developer confirmed payments work end-to-end in the browser; asked about mobile responsiveness → Day 3 began. New branch `feature/untold-mobile` off `feature/untold-v1` per developer request.
- **Mobile design was already mobile-first** (bottom tab bar + center FAB on <md, desktop side rail, `env(safe-area-inset-bottom)` on the bar, viewport-fit=cover). Fixed in the audit: bottom-bar columns now adapt to nav-item count (guests have 4 items since profile became guest-visible); **top safe-area insets added** — `.pt-safe`/`.top-safe` utilities in index.css applied to TopBar and every full-bleed header (Write, Voice, TodayPrompt, SOTD back button, Onboarding, Upgrade); FAB bottom offset now includes the safe inset.
- **Capacitor 8** in apps/theuntold: appId `com.tellcore.theuntold`, webDir dist, warm-paper background. `android/` + `ios/` committed (Capacitor's own .gitignores handle build outputs). Mic permissions: RECORD_AUDIO + MODIFY_AUDIO_SETTINGS (manifest), NSMicrophoneUsageDescription (Info.plist via PlistBuddy).
- **iOS**: Capacitor 8 uses SPM (CapApp-SPM) — CocoaPods NOT needed (brew-installed anyway, harmless). Simulator build verified: `xcodebuild -project ios/App/App.xcodeproj -scheme App -sdk iphonesimulator CODE_SIGNING_ALLOWED=NO build` with Xcode 16.4.
- **Android**: project targets **Java 21** — system JDK 17 fails with "invalid source release: 21". Fixed with `brew install openjdk@21`; build with `JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home ANDROID_HOME=$HOME/Library/Android/sdk ./gradlew assembleDebug`. SDK already at ~/Library/Android/sdk.
- Mobile apps bundle the built web app → API URL is baked from env at build time. iOS **simulator** can use localhost; **real devices need the deployed API URL** (rebuild web + `npx cap sync` after deployment). Android emulator would need 10.0.2.2 + cleartext (not configured — deliberate; devices get the HTTPS prod URL instead).
- App icons/splash are Capacitor defaults — replace with TheUntold branding (1024px icon via @capacitor/assets) before store submissions.
- Still needed from developer for D3.4/D3.5: Azure account, Cloudflare account, GitHub repo remote.

### 2026-09-02 — Pre-launch features (developer product review; branch feature/untold-mobile)
- Developer proposed 4 features; agreed scope after honest review: **per-story creator paywalls with direct UPI payouts REJECTED for launch** (payment-marketplace regulations/KYC, conflicts with the premium promise "read every community story in full", commercializes the feed; revisit post-traction via Stripe Connect WITH a commission or a tip button). Other three shipped:
- **Daily writing rhythm**: free users = 1 story per UTC day (`stories.free.perday`, default 1), paid unlimited — replaces the lifetime cap (code no longer reads stories.free.storylimit). Error `daily_limit_reached` → friendly "You've written today's page" toast. On-brand with "one page a day".
- **AI summaries**: analyze prompt emits `summary` (2-3 sentences, story's own language, only >~120 words). Stored in `Stories.Summary` (script 117), surfaces as an "In short" accent box above the reader (hidden on previews). Verified live.
- **Shareable story cards** (the growth loop): `storyCardRenderer.ts` draws 1080×1350 PNG cards on a raw canvas (fonts preloaded via document.fonts.load; word-wrap + ellipsis helpers; grain texture) in 4 templates — warm-paper, ink, golden-hour, postcard — each with the TheUntold wordmark + tagline. `ShareCardModal` on StoryDetail: template picker, live preview img, Web Share API with files (falls back to PNG download). Hidden on preview-gated stories. No new npm packages.
- **Delete account UI** on profile (ConfirmationModal → DELETE /users/me soft delete → clear + /welcome) — required by Play/App Store data-deletion policies.
- Known launch gaps recorded: password reset (needs email provider), report/block for UGC (Apple requirement before App Store), story EDIT screen (backend PATCH exists, no UI), privacy policy + ToS pages, key rotation before live.
- **2026-09-02 update**: report + edit SHIPPED (developer request). Reporting: `POST /stories/{id}/report` (reasons: harmful|spam|private-info|plagiarism|other; one per user per story; own-story blocked; ≥3 distinct open reports auto-unpublish → status flagged "under review after reader reports", threshold in `stories.reports.autohide`, table script 118). ReportStoryModal in story menu for non-owners. Editing: EditStoryPage at `/story/:id/edit` (title/body/visibility, prefis once per story id, re-moderation notice for shared) via existing PATCH; "Edit story" in menu for owners. Verified live: report 204 → duplicate 409; PATCH title round-trip. **Still deferred**: password reset, privacy policy + ToS, key rotation, block-user (report shipped; per-user blocking later).
