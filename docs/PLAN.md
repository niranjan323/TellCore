# PLAN.md — TheUntold v1 Sprint (Global Launch MVP)

> Living plan. Update checkboxes as work completes. Read together with PROJECT_MEMORY.md.
> Branch: `feature/untold-v1` (off `redesign/welcome-and-motion-v2`) → merge to `master` when complete.
> Sprint: 2026-08-31 → 2026-09-03 (3 days). Local first, then free-tier hosting for demo.

---

## 1. Goal

Ship TheUntold as a complete, demo-able product: web (desktop + mobile), Android APK, iOS build —
with real stories (voice + text, any language), AI processing, semantic search, payments,
public/private content, and a CI pipeline. Built to industry standards so it scales later
(Azure/AWS) without rework.

---

## 2. Locked Decisions (confirmed by developer 2026-08-31)

| Decision | Choice |
|---|---|
| Reuse vs rebuild | **Reuse** existing CoreBackend + theuntold frontend |
| Mobile apps | **Capacitor** wrapping the existing Vite React app (`com.tellcore.theuntold`) |
| Payments | **Stripe** (global). Test mode for demo. Razorpay/UPI post-MVP. Apple IAP addressed before iOS store release. |
| Paid model | **Premium membership**: free users write stories + read previews of public stories; paid unlocks full public stories, multilingual AI, audio playback, family vault, unlimited stories |
| Moderation | **AI moderation step** in pipeline before any story goes public; flagged stories stay private with reason shown to author |
| Vault invites | **Share-link invites** (secure token URL) — no email service in MVP |
| Languages | **English UI + any-language stories** — AI transcribes/keeps original/translates; full UI i18n post-MVP |
| Database | **SQL Server 2025** (Docker locally, Azure SQL free tier in prod) — native `VECTOR` for semantic search |
| AI orchestration | **FastAPI + LangGraph** internal service (`services/ai/`); .NET stays system of record and only caller |
| Branching | New branch per feature sprint; merge to `master` when complete |

---

## 3. Target Architecture

```
                    ┌─────────────────────────────────────────────┐
 Web (Vercel/CF) ──►│                                             │
 Android (Capacitor)│   CoreBackend (.NET 10)                     │──► SQL Server 2025
 iOS (Capacitor) ──►│   auth · stories · feed · vault · billing   │    (VECTOR search)
                    │   notifications · nav · themes · forms      │──► Object storage
                    └──────────────┬──────────────────────────────┘    (audio files)
                                   │ internal HTTP + shared secret
                                   ▼
                    ┌─────────────────────────────────────────────┐
                    │  AI Service (FastAPI + LangGraph, Python)   │──► Groq (Whisper + LLM)
                    │  transcribe → detect lang → clean →         │──► local embedding model
                    │  moderate → translate(en) → tag → embed     │    (multilingual-e5-small)
                    └─────────────────────────────────────────────┘
                                   ▲
                    Stripe ── webhooks ──► CoreBackend /billing/webhook
```

Principles (unchanged): backend is the brain; frontend renders API responses; Dapper + raw SQL;
soft delete + audit columns everywhere; backend-driven navigation gates paid features.

Scale-readiness rules (build now, cheap; pay off later):
- Stateless API (JWT only, no server sessions) — already true
- Media in object storage, never in DB
- AI processing is async with status polling (in-memory channel now → real queue later)
- Story reads designed cache-friendly (clean GET endpoints → CDN/Redis later)
- Rate limiting middleware + security headers + webhook signature verification from day one

---

## 4. Data Model — New Scripts (101+)

All tables carry standard audit columns (Id, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy, IsDeleted).
Local DB is dropped and recreated fresh: run 001–021, 099, 100, then:

```
101_Stories.sql              UserId, Title, Kind(voice|text), OriginalLanguage,
                             ContentText, AudioUrl, DurationSeconds,
                             Visibility(private|family|public), Status(draft|processing|published|flagged),
                             ModerationReason, PromptKey, ViewCount, PublishedAt
102_StoryTranslations.sql    StoryId, LanguageCode, Title, ContentText, IsAiGenerated
103_StoryTags.sql            StoryId, Tag
104_StoryEmbeddings.sql      StoryId, ChunkIndex, ChunkText, Embedding VECTOR(384)
105_StoryViews.sql           StoryId, ViewerUserId(NULL=guest), ViewedAt   (event log; ViewCount denormalized)
106_Streaks.sql              UserId, CurrentStreak, LongestStreak, LastEntryDate
107_FamilyMembers.sql        OwnerUserId, MemberUserId, Relationship, Status
108_VaultInvites.sql         OwnerUserId, Token, ExpiresAt, UsedByUserId
109_Notifications.sql        UserId, Type, Title, Body, LinkRoute, IsRead
110_Subscriptions.sql        UserId, StripeCustomerId, StripeSubscriptionId, PlanKey,
                             Status, CurrentPeriodEnd
111_PaymentEvents.sql        StripeEventId(unique — idempotency), Type, PayloadJson, ProcessedAt
112_FeaturedStories.sql      StoryId, FeaturedOn(date), IsManualPick
113_Users_Alter.sql          ADD IsProfilePublic BIT NOT NULL DEFAULT 1
```

Semantic search: cosine `VECTOR_DISTANCE` over StoryEmbeddings (brute force is fine at demo
scale; DiskANN vector index when data grows). Same SQL works on Azure SQL.

---

## 5. API Surface — New Endpoints

```
── Stories ──
POST   /api/v1/stories                      create draft (text now, or shell for voice)
POST   /api/v1/stories/{id}/voice           multipart audio upload
POST   /api/v1/stories/{id}/process         kick AI pipeline (async) → Status=processing
GET    /api/v1/stories/{id}/status          poll: processing|published|flagged
GET    /api/v1/stories/mine                 my stories
GET    /api/v1/stories/{id}                 FULL for owner/family/paid; PREVIEW (~600 chars,
                                            isPreview=true) for free/guest viewers of public stories
PATCH  /api/v1/stories/{id}                 edit title/content/visibility (re-moderate on publish)
DELETE /api/v1/stories/{id}                 soft delete
POST   /api/v1/stories/{id}/view            record view event (+ increment ViewCount)
GET    /api/v1/stories/search?q=            semantic search (public + own stories)

── Feed ──
GET    /api/v1/feed/featured?page=          public feed, paged
GET    /api/v1/feed/story-of-the-day        most-viewed public yesterday, manual override wins

── Streak ──
GET    /api/v1/users/me/streak

── Vault ──
POST   /api/v1/vault/invites                → { inviteUrl } (secure token, 7-day expiry)
POST   /api/v1/vault/invites/{token}/accept
GET    /api/v1/vault/members
GET    /api/v1/vault/stories                family-visible stories shared with me
DELETE /api/v1/vault/members/{id}           soft delete

── Notifications ──
GET    /api/v1/notifications
POST   /api/v1/notifications/{id}/read

── Billing (Stripe) ──
GET    /api/v1/billing/plans
POST   /api/v1/billing/checkout-session     → Stripe hosted checkout URL
POST   /api/v1/billing/webhook              anonymous, signature-verified, idempotent via PaymentEvents
GET    /api/v1/billing/status
```

Pattern stays Controller → Service → Repository, interface + class, thin controllers.

---

## 6. AI Service (`services/ai/`) — FastAPI + LangGraph

- Python 3.12 via `uv`. Groq key + shared internal secret via env vars (.env) —
  documented deviation: the Settings-table rule governs .NET; each service owns its secrets.
- Endpoints: `POST /v1/process-story` (text or audio file → result below),
  `POST /v1/embed-query`, `GET /healthz`.
- LangGraph pipeline: ingest → transcribe (Groq `whisper-large-v3`, if audio) → detect language
  → clean/structure (Groq LLM) → moderate (unsafe content + PII like phone numbers)
  → translate to English (keep original too) → tag → embed (`intfloat/multilingual-e5-small`, 384-dim, local CPU).
- Returns: `{ transcript, language, title, cleanedText, translationEn, tags[], moderation: {allowed, reason}, embeddings[] }`
- .NET `AiPipelineClient` calls it; story Status flows draft → processing → published|flagged.

## 7. Payments — Stripe (test mode)

- One product, monthly + yearly prices. Hosted Checkout Session → success/cancel routes in app.
- Webhook events: `checkout.session.completed`, `customer.subscription.updated|deleted` →
  update Subscriptions + `Users.UserType='paid'` + `SubscriptionExpiresAt`. Idempotent via PaymentEvents.
- Gating is 100% backend: navigation response + story preview logic. Frontend never role-checks.
- Frontend additions: UpgradePage (plans), success/cancel pages, preview→upgrade CTA on StoryDetail.
- Local webhook testing: `stripe listen --forward-to`.

## 8. Mobile — Capacitor

- `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios` in `apps/theuntold`.
- App id `com.tellcore.theuntold`; icons + splash from existing brand; mic permissions
  (AndroidManifest + Info.plist); API base URL must be HTTPS-reachable (hosted API) for device builds.
- Deliverables: debug APK (sideload) + iOS build running in Xcode/simulator. Store submission post-sprint.

## 9. Hosting (free tier) + CI

| Piece | Where | Notes |
|---|---|---|
| Web app | Cloudflare Pages or Vercel | free, global CDN |
| CoreBackend | Azure App Service F1 (container) or Render free | cold starts acceptable for demo |
| AI service | Hugging Face Space (16 GB free) or Render | HF fits the embedding model comfortably |
| Database | Azure SQL free tier (32 GB) | same T-SQL + VECTOR as local |
| Audio files | Cloudflare R2 (10 GB free) | `IFileStorageService` gets an R2/S3 implementation |
| CI/CD | GitHub Actions | path-filtered: backend / theuntold / ai jobs; deploy on master |

## 10. New Packages (approved via this plan)

- Backend: `Stripe.net` (official SDK — required for safe webhook signature verification)
- Frontend: `@capacitor/core|cli|android|ios`
- Python: `fastapi`, `uvicorn`, `langgraph`, `langchain-groq`, `sentence-transformers`, `pydantic-settings`

---

## 11. Day Plan

### Day 1 (Sep 1) — Database + backend core
```
✅ D1.1  mssql/server:2025-latest running (container `sqlserver2025`, volume tellcore-sql2025-data);
         fresh CoreBackend DB; scripts 001–021 + 099 + 100 verified (sqlcmd needs -I for filtered indexes)
✅ D1.2  Scripts 101–115 written + run (115_StoryHearts added; 114 seeds settings incl. payments.plans)
✅ D1.3  Entities + DTOs for Stories/Feed/Streak/Vault/Notifications/Billing (+ AI pipeline contracts)
✅ D1.4  StoryRepository + StoryService + StoriesController (CRUD, views, hearts, visibility, preview gating)
✅ D1.5  Feed + Profile(streak/stats/milestones) + Vault + Notifications + Billing (Stripe.net 52.4.0)
✅ D1.6  stories.api.ts swapped to real API (same fetch* signatures); Write/Voice pages save via
         POST /stories (+voice upload +process); VisibilityPicker added; StoryDetail wired
         (views, hearts, delete, preview→/upgrade card)
✅ D1.7  End-to-end verified via API: guest → text story → process (AI-absent fallback → private
         + honest reason) → mine/streak/plans; voice story → upload → published (family)
✅ D1.8  Committed (c3bf551 backend, frontend follows) + memory updated
```
Extra in D1: story processing worker (channel queue), AiPipelineClient, rate limiting,
security headers, LIKE search fallback, lazy story-of-the-day picker + featured notification.

### Day 2 (Sep 1, ran a day early) — AI pipeline + payments
```
✅ D2.1  services/ai scaffold (uv + Python 3.12, FastAPI, LangGraph) + /healthz + shared-secret auth
✅ D2.2  Pipeline: transcribe (Groq whisper-large-v3) → analyze (openai/gpt-oss-120b single structured
         call: language/title/cleanup/excerpt/translation/tags/PII) → moderate (gpt-oss-safeguard-20b,
         fail-closed) → embed (fastembed paraphrase-multilingual-MiniLM-L12-v2, 384-dim ONNX)
✅ D2.3  .NET AiPipelineClient wired end-to-end; flagged-story flow verified (contact-info story flagged)
✅ D2.4  Embeddings persisted; VECTOR_DISTANCE search verified CROSS-LINGUAL (English query found the
         Telugu story); semantic search box added to FeaturedFeedPage
✅ D2.5  Stripe live in test mode: product prod_VBB1GNAlVIVewP + monthly/yearly prices created via API,
         keys + price ids + whsec in Settings; stripe CLI (~/.local/bin/stripe) forwarding webhooks;
         full loop verified: subscription paid → webhook → UserType=paid → refresh → full nav
✅ D2.6  UpgradePage + UpgradeSuccessPage (poll status → JWT refresh) + preview→/upgrade card;
         VaultJoinPage + invite links UI on FamilyVaultPage (+ shared-stories section)
✅ D2.7  End-to-end verified: Telugu text story published to community w/ translation; voice story
         (real speech) transcribed + AI-titled + published; guest→paid upgrade loop green
✅ D2.8  Committed + memory updated
```
Notes: Groq deprecated llama-3.3 — models now openai/gpt-oss-120b + gpt-oss-safeguard-20b.
India-registered Stripe account ⇒ export payments need customer name+address
(BillingAddressCollection=required set; hosted Checkout collects it).

### Day 2.5 (Sep 1) — Frontend coverage audit (developer request)
```
✅ Profile → Account section: user type + email card, "Continue with Google" for guests,
   Sign out (POST /auth/logout + store clear), membership card (plan/renewal,
   Upgrade CTA or "Manage subscription" → NEW Stripe customer-portal endpoint),
   public/private profile toggle (PATCH /users/me/privacy)
✅ /users/me now returns isProfilePublic
✅ Notifications: click marks read + follows linkRoute
✅ My Stories: status chips on own cards (Processing / Needs a change / Family / Everyone)
✅ Story detail: flagged-reason + still-processing notices for the owner
✅ Demo data seeded through the real pipeline: 5 named users, 7 community stories in
   en/hi/es/te with hearts + views (scratchpad/seed_demo.py)
⬜ Google OAuth client id (developer to create) — only guest login works until then
⬜ Stripe customer portal: save the default portal config once in the Stripe test
   dashboard (Settings → Billing → Customer portal → Save) or the Manage button 503s
```

### Day 3 (Sep 3) — Mobile + ship
```
⬜ D3.1  Capacitor init + android + ios; permissions; icons/splash
⬜ D3.2  Debug APK built + iOS app running in simulator; device smoke test of voice recording
⬜ D3.3  Mobile polish audit (safe-area insets, keyboard, touch targets)
⬜ D3.4  Deploy: Azure SQL free + run scripts; CoreBackend container; AI service; web; R2 storage impl
⬜ D3.5  GitHub Actions: ci.yml (build/test per path) + deploy.yml (master → hosts)
⬜ D3.6  Demo walkthrough checklist; final PROJECT_MEMORY.md + PLAN.md update
```

---

## 12. Definition of Done (sprint)

- [ ] Guest → write/voice story in any language → AI processes → published or flagged with reason
- [ ] Public feed + story of the day + view counts working from real DB
- [ ] Semantic search returns relevant stories across languages
- [ ] Free viewer sees preview of public story; Stripe test payment unlocks full content
- [ ] Family vault via share link works
- [ ] Web deployed on free tier; APK installable; iOS build runs
- [ ] CI pipeline green on the monorepo
- [ ] PROJECT_MEMORY.md reflects final state

## 13. Risks / Watch Items

- **Groq free tier**: 30 req/min — fine for demo; retry/backoff in AI service; upgrade key later.
- **SQL 2025 on Apple Silicon**: amd64 image under Rosetta emulation (2022 already runs this way here).
- **Free-tier cold starts**: first request after idle is slow — acceptable for demo; note in walkthrough.
- **Embedding model RAM**: ~0.5 GB — fits HF Space; too tight for Render 512 MB (fallback: hosted embedding API).
- **Apple IAP policy**: digital subscriptions in the iOS *store* build must use IAP — must solve before App Store release, not for demo.
- **Stripe live mode** requires business verification — demo stays in test mode.

## 14. Out of Scope (post-MVP backlog)

Time capsules · reactions/comments · email invites · full UI i18n · video stories ·
Razorpay/UPI · admin console · Redis cache · real message queue · store submissions ·
PWA/service worker · Claude/OpenAI provider swap.
