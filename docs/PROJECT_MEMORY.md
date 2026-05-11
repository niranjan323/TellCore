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
24. FormSetRepository + FormsController
25. SessionRepository + SessionsController
26. LocalFileStorageService + voice note upload endpoint
27. AnswerRepository
28. SummaryFormatterService (rule-based, no AI)
29. NullAiSummaryService
30. GroqAiSummaryService + voice transcription
31. SubmitResponse — full pipeline (AuthService orchestrates)
32. SummaryRepository + ResponsesController
33. ConfigController
34. ExceptionMiddleware
35. DI wiring in Program.cs
    Test: All endpoints working via Scalar locally
```

### Phase 2 — PreDoc Frontend
```
38. tailwind.config.ts with CSS variable mapping
39. contracts.ts — TypeScript types matching CoreBackend Models/Responses
40. api/client.ts — Axios + JWT interceptor + auto-refresh
41. All api/*.ts files
42. authStore.ts + sessionStore.ts (Zustand)
43. injectTheme.ts
44. useTheme hook
45. useAppConfig hook
46. useNavigation hook
47. App.tsx — startup sequence + router
48. AppShell + NavBar — renders from navigation API
49. Guest auto-creation on first load
50. AuthPage — Google OAuth
51. IntroPage — intro text + audio player
52. VoiceRecorder component
53. ConditionEngine.ts
54. All question type components
55. QuestionRenderer.tsx
56. QuestionsPage — full form flow + progress bar
57. SummaryView component
58. PdfExport component
59. SummaryPage
60. HistoryPage (registered users)
    Test: Full end-to-end journey works locally
```

### Phase 3 — TheUntold Frontend
```
61. Seed SQL — Products, FormSets, Themes, Nav for theuntold
62. Copy PreDoc frontend structure to apps/theuntold
63. Update VITE_PRODUCT_SLUG + theme defaults + content
64. Full end-to-end test locally
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
