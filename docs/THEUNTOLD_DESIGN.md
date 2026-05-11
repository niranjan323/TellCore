# TheUntold — Design Specification
> Read this fully before building any TheUntold UI component or screen.
> This document describes WHAT to build visually.
> PROJECT_MEMORY.md tells you HOW to structure code, API integration, etc.

---

## 1. Product Overview

**Product:** TheUntold
**Purpose:** A place where ordinary people record their unshared life stories — the everyday moments, lessons, regrets, love, wisdom that disappear when someone dies.
**Tagline:** "Every life has a story worth keeping."
**Path in repo:** `apps/theuntold/`

This is NOT a journaling app.
This is a place to preserve the human soul, one story at a time.
Family will read these stories long after the user is gone.

Users open it daily. They speak or write one story.
The platform features the best stories every day.
Featured stories spread emotion across the community.

The app must feel **emotional, warm, and special** — not productive, not clinical, not flat.
Visual identity is **completely different** from PreDoc.

---

## 2. Visual Design Principles

1. **Emotion first** — every screen should make the user feel something
2. **Story is sacred** — typography is hero, content is king
3. **Daily ritual** — opening the app should feel like a warm habit, not a task
4. **Beauty in simplicity** — minimal but with soul (Medium meets Headspace)
5. **Warm, not corporate** — handwritten accents, soft textures, organic feel
6. **Editorial elegance** — feels like a published magazine, not an app
7. **Slow and intentional** — opposite of social media speed; encourages reflection

---

## 3. Theme Variables

These CSS variable values must be seeded into the backend for the `warm-paper` theme (Section 8 of PROJECT_MEMORY.md).

```
Colors (warm, emotional palette):
  --primary              #c08552  (warm terracotta)
  --primary-light        #f5e8dc  (soft cream)
  --primary-dark         #7a4f30  (rich brown)
  --surface              #fdfaf6  (paper cream — never pure white)
  --surface-secondary    #f5f0e8  (warm beige)
  --text-primary         #2b2421  (ink black)
  --text-secondary       #5c534d  (warm grey)
  --text-hint            #a59a92  (soft grey)
  --border               rgba(89,71,55,0.12)  (warm border)
  --accent               #d4a574  (gold accent — for featured items)

Radius:
  --radius-sm            6px
  --radius-md            10px
  --radius-lg            16px

Spacing:
  --spacing-base         16px

Typography (TWO fonts — editorial feel):
  --font-display         "Lora", serif         (story titles)
  --font-body            "Nunito", sans-serif  (UI text)
  --font-handwritten     "Caveat", cursive     (accents only)
  --font-size-base       16px
```

**Hard rule:** No component ever uses a hardcoded color, font, size, or radius.
All Tailwind classes reference these variables via `tailwind.config.ts`.

---

## 4. Responsive Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | 375px | Single column, bottom nav |
| Tablet | 768px | Two column on dashboard, bottom nav |
| Desktop | 1280px | Three column on dashboard, side nav |

**Mobile-first approach.**

---

## 5. Screens to Build

These map to `apps/theuntold/src/pages/`. Add to the pages folder beyond what's listed in PROJECT_MEMORY.md Section 12 — TheUntold has more screens than PreDoc.

### 5.1 SplashScreen (`pages/SplashScreen.tsx`)
- App logo (fading letter, envelope, or candle metaphor)
- App name "TheUntold" in serif display font
- Tagline below: "Every life has a story worth keeping"
- Soft fade-in animation

### 5.2 OnboardingPage (`pages/OnboardingPage.tsx`)
Three-step onboarding for first-time users.

**Screens:**
1. "Stories that matter, kept forever" — illustration of an open book
2. "Speak or write — one story a day" — illustration of voice and pen
3. "Your family will thank you" — illustration of generations connecting

**Layout each step:**
- Beautiful editorial illustration (top half)
- Headline in serif (--font-display)
- Description in body font
- Progress dots at bottom
- "Next" primary button
- "Skip" link top right

### 5.3 DashboardPage (`pages/DashboardPage.tsx`)
**THE most important screen.** Users see this daily. Must feel like opening a beautiful book.

**Layout sections (top to bottom):**

**Greeting block:**
- Personal greeting (from API): "Good evening, [name]"
- Today's date in `--font-handwritten` style
- Streak counter widget: circular ring around small flame icon, e.g. "7 days"

**Story of the Day block (hero):**
- Big featured story card
- Author photo (circular) + name
- Story title in `--font-display` (28-36px)
- 2-3 line excerpt
- "Read story" button (primary)
- Subtle gold "Featured" badge using `--accent`

**Today's Prompt block:**
- Card with today's prompt question
- Background: `--primary-light` with subtle texture
- "Tell this story" big primary button

**Community block:**
- Heading: "Recent stories"
- Small story cards in horizontal scroll (mobile) or grid (desktop)
- 4-6 cards visible

**Your stories block:**
- Heading: "Your library" + "View all" link
- 2-3 of user's recent stories

### 5.4 TodayPromptPage (`pages/TodayPromptPage.tsx`)
**Layout:**
- Soft background illustration (subtle, low opacity)
- Big prompt question in `--font-display`
- Below the prompt, two big cards side-by-side (mobile: stacked):
  - "Speak it" card — microphone icon, "Tell your story aloud"
  - "Write it" card — pen icon, "Write it down"
- "Skip today" small ghost button
- "See past prompts" link at bottom

### 5.5 VoiceRecordingPage (`pages/VoiceRecordingPage.tsx`)
**Layout:**
- Prompt text shown softly at top
- Centered large record button (glowing pulse when recording)
- Warm waveform animation during recording (warm colors, not blue)
- Timer in `--font-display`
- Stop button
- After stopping:
  - Replay button
  - Re-record button
  - "Save story" primary button at bottom

### 5.6 WriteStoryPage (`pages/WriteStoryPage.tsx`)
**Layout:**
- Top bar: back button + auto-save indicator ("Saved 2 minutes ago")
- Prompt shown softly above the editor
- Large text area with typewriter feel
  - Use `--font-body` but larger size (18-20px)
  - Generous line height (1.7)
- Word count bottom right (small)
- "Save story" primary button bottom

### 5.7 MyStoriesPage (`pages/MyStoriesPage.tsx`)
**Layout:**
- Top: search bar + filter chips (tags, year, type)
- View toggle: grid / list
- Story cards (uses StoryCard component):
  - Title in `--font-display`
  - Date in `--font-handwritten`
  - Preview: waveform for voice, excerpt for text
  - Small tag
- Empty state: warm illustration + "Your first story will appear here" + "Write your first story" CTA

### 5.8 StoryDetailPage (`pages/StoryDetailPage.tsx`)
**Layout:**
- Top bar: back button + actions menu (Edit, Share, Delete, Submit for feature)
- Story title in `--font-display` (32-48px)
- Author byline + date in `--font-handwritten`
- For voice stories: beautiful audio player with waveform (full width)
- For text stories: typography-optimized reading view
  - Max width 680px for readability
  - Line height 1.7
  - Serif body font for stories (override `--font-body` here)
- Bottom: tags, optional submit for feature button

### 5.9 FeaturedFeedPage (`pages/FeaturedFeedPage.tsx`)
**Layout:**
- Filter tabs: Today / This Week / This Month / All Time
- Top: featured story card (large, magazine-style)
- Below: editorial grid of story cards
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3 columns
- Each card shows: author, title, excerpt, heart count

### 5.10 StoryOfTheDayPage (`pages/StoryOfTheDayPage.tsx`)
Full-screen featured story view.

**Layout:**
- Top: full-bleed background (soft texture or photo)
- "Story of the Day" gold badge using `--accent`
- Story title in huge `--font-display` (48-64px)
- Author photo + name + date elegantly placed
- Story body in serif, max-width 680px, generous typography
- Bottom actions: Save to favourites, Share story
- CTA at very bottom: "Submit your own story"

### 5.11 ProfilePage (`pages/ProfilePage.tsx`)
**Layout:**
- Top: large avatar with streak ring around it
- Name + bio (editable)
- Stats row: Total stories | Days active | Words written | Featured
- Milestones timeline:
  - "Wrote your first story" — date
  - "7-day streak achieved" — date
  - "Story featured" — date
- Settings link at bottom

### 5.12 FamilyVaultPage (`pages/FamilyVaultPage.tsx`)
Paid users only — backend controls visibility via navigation API.

**Layout:**
- Header: "Shared with family"
- List of family members invited (with status)
- Stories shared section
- "Add family member" primary button
- "Time capsule" section: schedule stories for future release

### 5.13 AuthPage (`pages/AuthPage.tsx`)
**Layout:**
- Beautiful warm background (subtle paper texture)
- Centered card with logo
- "Continue with Google" button (Google brand colors allowed only here)
- "Continue as guest" link
- Trust message: "Your stories are yours. Always."

### 5.14 NotificationsPage (`pages/NotificationsPage.tsx`)
**Layout:**
- List of notifications:
  - Daily prompt reminder
  - "Your story was featured!" — gold celebration card
  - "X liked your story"
  - Family member added a story
- Beautiful celebratory animations for feature notifications

---

## 6. Reusable Components to Build

These map to `apps/theuntold/src/components/`.

### 6.1 Layout — `components/layout/`

**AppShell.tsx**
- Wraps every page with editorial feel
- Top bar (minimal) + page content + bottom nav (mobile) or side nav (desktop)
- Reads nav items from `useNavigation()` hook

**NavBar.tsx**
- Mobile: bottom tab bar — Home, Write (FAB), Stories, Profile
- Desktop: sidebar with icons + labels
- "Write" item is a Floating Action Button (FAB) in center on mobile
- Active item: warm color highlight using `--primary`

**TopBar.tsx**
- Minimal — just logo + notification bell
- Logo uses `--font-display`

### 6.2 Story Components — `components/stories/`

**StoryCard.tsx**
- Three variants: `compact`, `featured`, `editorial`
- Receives `story` object as prop
- Compact: small list item with title + date
- Featured: large card for dashboard hero
- Editorial: magazine-style for feed pages
- Title in `--font-display`, date in `--font-handwritten`

**StoryReader.tsx**
- Typography-optimized full story view
- Receives `story` object as prop
- Handles both voice (with player) and text stories

**AudioStoryPlayer.tsx**
- Custom audio player with waveform visualization
- Warm colors only — not blue
- Play/pause, scrub, time display
- Speed control (0.5x, 1x, 1.5x)

**MemoryCard.tsx**
- Beautiful shareable visual for social
- Story quote on warm gradient background
- Author name at bottom
- TheUntold logo subtle in corner
- Can be exported as image

### 6.3 UI — `components/ui/`

**Button.tsx**
- Variants: `primary`, `secondary`, `ghost`, `gold` (for featured actions)
- States: default, hover, pressed, disabled, loading
- Receives `label`, `onClick`, `variant`, `loading`, `disabled` as props
- Uses `--primary` for primary variant, `--accent` for gold variant

**FAB.tsx**
- Floating action button for "Write new story"
- Large circular button with primary color
- Fixed position bottom-right on desktop, center-bottom on mobile

**Spinner.tsx**
- Gentle loading indicator
- Uses `--primary` color

**EmptyState.tsx**
- Receives `illustration`, `title`, `description`, `ctaLabel`, `onCta` as props
- Centered layout with warm illustration

### 6.4 Profile Components — `components/profile/`

**StreakCounter.tsx**
- Circular ring around avatar showing streak progress
- Subtle flame icon
- Animated when streak increases
- 7 days = small flame, 30 days = bigger flame, 100 days = glowing with gold ring

**MilestoneBadge.tsx**
- Earned achievement display
- Icon + label + date
- Subtle gold accent for special milestones

**StatTile.tsx**
- Single number with label below
- Example: "47 stories"

### 6.5 Writing — `components/writing/`

**VoiceRecorder.tsx**
- Emotional, warm recording UI
- Big circular record button (glows when recording)
- Warm waveform animation
- Timer in `--font-display`
- Receives `prompt`, `onSave`, `onCancel` as props

**TextEditor.tsx**
- Typewriter-style writing experience
- Auto-save with timestamp display
- Word count
- Receives `prompt`, `value`, `onChange`, `onSave` as props

### 6.6 Feedback — `components/ui/`

**Toast.tsx** — soft notification, warm colors
**ConfirmationModal.tsx** — for destructive actions

---

## 7. Typography Spec

| Element | Font | Size | Weight |
|---|---|---|---|
| Hero story title | `--font-display` | 48-64px | 600 |
| Story title | `--font-display` | 28-36px | 600 |
| Page title | `--font-display` | 24-28px | 500 |
| Story body | serif | 18-20px | 400 |
| Body text | `--font-body` | 15-16px | 400 |
| Date / accent | `--font-handwritten` | 16-18px | 400 |
| Helper text | `--font-body` | 13-14px | 400 |

Line height: 1.7 for story body (readability), 1.5 for UI body, 1.2 for headings.

---

## 8. Special Visual Details

### Streak Counter
- 1-6 days: small grey flame
- 7+ days: warm orange flame
- 30+ days: bigger flame with subtle glow
- 100+ days: gold ring around flame using `--accent`
- Never shame the user for breaking streak

### Story of the Day Badge
- Gold pill using `--accent`
- Small star or laurel icon
- Subtle shadow for elevation

### Paper Texture
- Subtle paper texture on cards (1-2% opacity overlay)
- Adds warmth without distraction

### Quotation Marks
- Decorative serif quotation marks in `--primary-light`
- Used at the start of featured story excerpts

---

## 9. What NOT To Do

- No flat corporate aesthetic
- No bright social media colors (purple gradients, neon)
- No emojis in body text
- No "share to social" pushy messaging
- No anxiety-inducing notifications
- No likes/follower counts on user profiles (no social pressure)
- No advertising layout
- No dark UI as default (warm paper cream is the surface)
- No pure white anywhere — always use `--surface` paper cream
- No hardcoded text inside components

---

## 10. Component Implementation Rules

When building any component:

1. **Props for content** — all text, icons, color variants from props or API
2. **Tailwind classes only** — never inline styles, never raw colors
3. **TypeScript types** — every prop typed
4. **Accessibility** — ARIA labels, keyboard nav, focus states
5. **Mobile-first** — write mobile styles first, scale up
6. **No API calls in components** — components receive data via props from hooks
7. **No role checks** — backend navigation controls visibility

---

## 11. Build Order

Build in this order:

```
1. UI components (Button, FAB, Spinner, Toast, EmptyState)
2. Layout (AppShell, TopBar, NavBar)
3. Story components (StoryCard variants, StoryReader, AudioStoryPlayer)
4. Profile components (StreakCounter, MilestoneBadge, StatTile)
5. Writing components (VoiceRecorder, TextEditor)
6. Memory components (MemoryCard for sharing)
7. Pages — Splash → Onboarding → Auth → Dashboard → Today's Prompt → 
            Voice/Write → My Stories → Story Detail → Featured Feed → 
            Story of the Day → Profile → Family Vault → Notifications
```

---

## 12. What Makes TheUntold Different

Design must express these qualities — verify each screen against them:

1. **Editorial elegance** — feels like reading a published magazine
2. **Personal warmth** — handwritten elements, organic textures
3. **Celebration of ordinary lives** — every user feels important
4. **Daily ritual** — like morning coffee or evening prayer
5. **Permanence** — feels built to last, not consumed and discarded
6. **Emotional weight** — every pixel respects what users are sharing

If a screen feels rushed, transactional, or generic — redo it.
The goal: when a user opens this app, they feel they are entering a sacred space.

---

## 13. Reference Section

| Topic | Where to find it |
|---|---|
| Folder structure | PROJECT_MEMORY.md Section 12 |
| API endpoints | PROJECT_MEMORY.md Section 11 |
| Theme variable injection | PROJECT_MEMORY.md Section 8 |
| Backend seeding | PROJECT_MEMORY.md Section 5 |
| Tailwind config | PROJECT_MEMORY.md Section 8 |
| Build steps (61-64) | PROJECT_MEMORY.md Section 15 Phase 3 |

---

## 14. Backend Seeding Required for TheUntold

Before frontend works, backend must have these seeded:

```sql
-- Product
INSERT INTO Products (Slug, Name, Description, DefaultThemeSlug, DefaultLanguage)
VALUES ('theuntold', 'TheUntold', 'Life story keeper', 'warm-paper', 'en');

-- Theme + Theme Variables (all values from Section 3 above)

-- Navigation Items per user role (guest, registered, paid)

-- FormSet for daily story prompts (one prompt per day rotation)
```

---

*Use this document together with PROJECT_MEMORY.md when building TheUntold UI.*