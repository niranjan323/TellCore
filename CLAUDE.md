# CLAUDE.md — TellCore Platform
# Claude Code reads this file automatically at the start of every session.
# This file tells Claude HOW to work on this project.
# PROJECT_MEMORY.md tells Claude WHAT to build.

---

## Step 1 — Always Do This First

Before writing any code, running any command, or making any decision:

1. Read `docs/PROJECT_MEMORY.md` fully
2. Identify which Phase and Step we are currently on
3. Confirm with the developer before starting
4. Never skip ahead

---

## Step 2 — Understand the Repo Structure

This is a monorepo. Three solutions in one repo:

```
TellCore/
├── backend/CoreBackend/src/CoreBackend.API/   ← Single ASP.NET Core project (.NET 10)
│   ├── Controllers/
│   ├── Models/
│   ├── Services/
│   ├── Repositories/
│   └── Middleware/
├── apps/predoc/             ← Vite React (PreDoc app)
├── apps/theuntold/          ← Vite React (TheUntold app)
└── docs/PROJECT_MEMORY.md   ← source of truth — read first always
```

Never confuse which solution you are working in.
Always confirm the current working directory before running commands.

---

## Step 3 — How to Work

### One step at a time
Complete one step fully before moving to the next.
Do not partially implement two things at once.
If a step is too large, break it down and confirm with the developer.

### Ask before inventing
If something is not in PROJECT_MEMORY.md, stop and ask.
Do not invent new patterns, new packages, or new architecture.
The memory file is the law.

### Test before moving on
After completing each step, verify it works.
For backend: test the endpoint with a quick curl or confirm it compiles.
For frontend: confirm the component renders without errors.
Do not mark a step complete until it actually works.

### Small commits
After each working step, commit with a clear message:
```
git add .
git commit -m "feat(backend): add settings repository and GetSettingQuery"
```

Commit message format: `type(scope): description`
Types: `feat`, `fix`, `chore`, `refactor`, `docs`
Scopes: `backend`, `predoc`, `theuntold`, `db`, `docs`

---

## Step 4 — Updating PROJECT_MEMORY.md

This is critical. PROJECT_MEMORY.md must always reflect the current state of the project.

### When to update PROJECT_MEMORY.md

Update it when any of these happen:

- A step is completed → mark it done in the build order
- A decision is made that is not in the document → add it
- A package version is confirmed → add the exact version
- A pattern is established → document it
- A bug or gotcha is discovered → add it to a "Known Issues" section
- The developer changes a requirement → update the relevant section

### How to mark steps complete

In Section 15 (Build Order), add ✅ next to completed steps:

```
✅ 10. Domain entities — all C# entity classes with audit fields
✅ 11. Contracts — all request/response DTOs
⬜ 12. IDbConnectionFactory interface + Dapper implementation
```

### How to add new information

Add a "## 18. Session Notes" section at the bottom if it doesn't exist.
Append new discoveries there with the date:

```
## 18. Session Notes

### 2025-01-15
- Confirmed Dapper version 2.1.35 works with .NET 9
- SQL Server connection string requires TrustServerCertificate=true locally
- Groq free tier limit: 30 requests/minute — add retry logic

### 2025-01-16
- PreDoc guest flow working end to end
- Voice recorder uses MediaRecorder API — works in Chrome, Firefox
- Safari requires webkit prefix for MediaRecorder
```

### Never remove existing content
Only add or update. Never delete decisions already documented.
If something changes, mark it as updated:
```
~~Old approach~~ → New approach (updated 2025-01-15: reason)
```

---

## Step 5 — Backend Rules (CoreBackend)

- Single project: Controller → Service → Repository pattern.
- No Entity Framework. No ORM. Dapper only.
- All SQL written manually in the repository layer.
- Every table has audit columns: Id, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy, IsDeleted.
- Never hard delete. Always soft delete (IsDeleted = 1).
- AI keys go in Settings table only — never in appsettings.json.
- Never return IsSecret = true settings to any frontend.
- Controllers are thin — call services only. No business logic in controllers.
- Services define an interface (IXxxService) and a class (XxxService).
- Repositories define an interface (IXxxRepository) and a class (XxxRepository).

---

## Step 6 — Frontend Rules (PreDoc and TheUntold)

- No hardcoded colors, fonts, sizes, spacing — CSS variables only.
- No hardcoded navigation — always rendered from API response.
- No hardcoded question content — always rendered from API response.
- No role checks in frontend — backend controls access via navigation response.
- All API calls in `src/api/` files — never inline in components or hooks.
- Hooks call API files — components call hooks.
- Tailwind classes must map to CSS variables — never raw color values.

---

## Step 7 — If You Are Unsure

Stop. Do not guess. Ask the developer:
- "This is not covered in PROJECT_MEMORY.md. Should I [option A] or [option B]?"
- "Step X requires [something]. Do you want me to proceed or adjust?"

It is better to ask than to build the wrong thing.

---

## Step 8 — Starting a New Session on a Different Machine

If this is a new machine or new session:

1. Read `docs/PROJECT_MEMORY.md` — check Section 15 for ✅ marks to know current progress
2. Check Section 18 (Session Notes) for recent discoveries
3. Run `git log --oneline -10` to see last 10 commits
4. Ask developer: "We are at Step X. Ready to continue with Step X+1?"
5. Never assume progress — always verify from the memory file and git log

---

## Quick Reference

| What | Where |
|---|---|
| Architecture decisions | docs/PROJECT_MEMORY.md |
| Current progress | docs/PROJECT_MEMORY.md Section 15 (✅ marks) |
| Recent discoveries | docs/PROJECT_MEMORY.md Section 18 |
| Backend code | backend/CoreBackend/src/ |
| PreDoc frontend | apps/predoc/src/ |
| TheUntold frontend | apps/theuntold/src/ |
| DB scripts | backend/CoreBackend/src/CoreBackend.Infrastructure/Persistence/Scripts/ |
| Commit history | git log --oneline |
