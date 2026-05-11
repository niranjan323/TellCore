# PreDoc — Design Specification
> Read this fully before building any PreDoc UI component or screen.
> This document describes WHAT to build visually.
> PROJECT_MEMORY.md tells you HOW to structure code, API integration, etc.

---

## 1. Product Overview

**Product:** PreDoc
**Purpose:** Helps users explain their symptoms clearly to a doctor before the visit.
**Tagline:** "You know something is wrong. We help you explain it."
**Path in repo:** `apps/predoc/`

This is a calm, trustworthy, medical-but-not-clinical app.
It does NOT diagnose. It does NOT show health information.
It only helps the user organise what they want to tell the doctor.

The user feels anxious or unwell when they open it.
The design must feel reassuring, organised, and effortless.

---

## 2. Visual Design Principles

1. **Calm not clinical** — soft greens and warm neutrals, never hospital blue
2. **One thing at a time** — never overwhelm with multiple questions
3. **Fast and effortless** — tap-to-select wherever possible, minimal typing
4. **Trustworthy** — clean typography, generous whitespace, no anxiety triggers
5. **Universal** — must work for elderly users and low-literacy users
6. **No alarming colors** — never red, bright orange, or alarming yellows

---

## 3. Theme Variables

These CSS variable values must be seeded into the backend for the `calm-green` theme (Section 8 of PROJECT_MEMORY.md). The frontend reads them from the API at startup.

```
Colors:
  --primary              #1d9e75  (calm green)
  --primary-light        #e1f5ee  (mint)
  --primary-dark         #0f6e56  (forest)
  --surface              #ffffff  (white)
  --surface-secondary    #f7f7f5  (warm grey)
  --text-primary         #1a1a1a  (near-black)
  --text-secondary       #666660  (medium grey)
  --text-hint            #aaa9a3  (light grey)
  --border               rgba(0,0,0,0.08)
  --error                #d4537e  (soft rose — for errors only)
  --success              #1d9e75  (same as primary)

Radius:
  --radius-sm            8px
  --radius-md            12px
  --radius-lg            16px

Spacing:
  --spacing-base         16px

Typography:
  --font-body            "Nunito", sans-serif
  --font-size-base       15px
```

**Hard rule:** No component ever uses a hardcoded color, font, size, or radius.
All Tailwind classes reference these variables via `tailwind.config.ts`.

---

## 4. Responsive Breakpoints

Every screen must work at all three sizes.

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | 375px | Single column, bottom nav |
| Tablet | 768px | Single column, wider padding, bottom nav |
| Desktop | 1280px | Centered card, max-width 720px, optional side nav |

**Mobile-first approach.** Build mobile first, scale up.

---

## 5. Screens to Build

These map to `apps/predoc/src/pages/` per Section 12 of PROJECT_MEMORY.md.

### 5.1 IntroPage (`pages/IntroPage.tsx`)
The first screen after splash/auth.

**Layout:**
- Centered content
- App logo at top (small)
- Warm headline (dynamic from backend): e.g. "Let's prepare for your visit"
- Short description below (2-3 lines): explains what the app does
- Primary button "Start"
- Secondary button "Record a voice note first"
- Language selector — small, top right
- Trust message at bottom: "No account needed · Works offline"

**Mobile:** Single column, generous vertical padding.
**Desktop:** Same layout, max-width 480px, vertically centered.

### 5.2 QuestionsPage (`pages/QuestionsPage.tsx`)
The main form screen — most important screen.

**Layout:**
- Top bar: progress indicator ("Question 3 of 8") + close button
- Top right: language selector
- Center: ONE question only — never multiple
- Question label — large, clear (18-22px)
- Question input — rendered by `QuestionRenderer.tsx` based on type
- Bottom: Back button (ghost) + Next button (primary)
- Smooth fade transition between questions
- Progress bar at very top using `--primary` color

**Mobile:** Full screen, question takes 70% of vertical space.
**Desktop:** Centered card max-width 600px.

### 5.3 SummaryPage (`pages/SummaryPage.tsx`)
Shown after form submission.

**Layout:**
- Title: "Your visit summary" (from API)
- Subtitle: "Show this to your doctor" (from API)
- Card containing summary sections (from API)
  - Each section: small uppercase label + value below
  - Sections separated by thin border lines
- Bottom action buttons:
  - "Share" (always)
  - "Save as PDF" (paid users only — controlled by nav API)
  - "Start over" (ghost)
- Disclaimer at bottom in small text (from API)

**Mobile:** Full width card with padding.
**Desktop:** Centered card max-width 720px.

### 5.4 AuthPage (`pages/AuthPage.tsx`)
For Google sign-in.

**Layout:**
- Centered card with logo
- "Continue with Google" button (Google brand colors allowed only here)
- "Continue as guest" link below
- Trust message: "We never share your data"

### 5.5 HistoryPage (`pages/HistoryPage.tsx`)
Registered users only.

**Layout:**
- Top bar with "My visits" title
- Filter by date (small chip selector at top)
- List of past visits:
  - Each item: date + main complaint preview + chevron
- Empty state: friendly illustration + "Your first visit summary will appear here"

### 5.6 Splash / Loading State
Brief screen on app load.

**Layout:**
- App logo centered
- Subtle pulse animation
- Tagline below in `--text-secondary`

---

## 6. Reusable Components to Build

These map to `apps/predoc/src/components/` per Section 12 of PROJECT_MEMORY.md.

### 6.1 Layout — `components/layout/`

**AppShell.tsx**
- Wraps every page
- Renders top bar + page content + bottom nav (mobile) or side nav (desktop)
- Reads nav items from `useNavigation()` hook — never hardcoded

**NavBar.tsx**
- Mobile: bottom fixed bar with 3-4 icons + labels
- Desktop: side bar or top bar
- Receives `items[]` array as prop
- Active item highlighted with `--primary`
- Uses lucide-react icons (icon name comes from API)

### 6.2 UI — `components/ui/`

**Button.tsx**
- Variants: `primary`, `secondary`, `ghost`
- States: default, hover, pressed, disabled, loading
- Minimum 48px tall on mobile (tap target)
- Rounded corners using `--radius-md`
- Receives `label`, `onClick`, `variant`, `loading`, `disabled` as props
- No hardcoded text inside

**Spinner.tsx**
- Circular spinning indicator
- Uses `--primary` color
- Size prop: sm, md, lg

**ErrorMessage.tsx**
- Inline error display
- Uses `--error` color
- Receives `message` prop
- Optional `retry` callback

### 6.3 Questions — `components/questions/`

All question components share this interface:
```ts
interface QuestionProps {
  label: string;
  placeholder?: string;
  value: unknown;
  onChange: (value: unknown) => void;
  required?: boolean;
  helpText?: string;
}
```

They never know what question they are. They just render based on type.

**TextAreaQuestion.tsx** — multiline text input with character count
**TextInputQuestion.tsx** — single line text input
**ChipsQuestion.tsx** — row of selectable pill buttons (single or multi-select prop)
**RadioQuestion.tsx** — single choice list with radio circles
**CheckboxQuestion.tsx** — multi choice list with checkboxes
**BodyMapQuestion.tsx** — interactive SVG body diagram, front and back view, tappable regions
**SliderQuestion.tsx** — pain scale 1-10 with color gradient or emoji indicators
**DateQuestion.tsx** — calendar date picker
**InfoBlock.tsx** — text-only display, no input (just renders helpful info between questions)

**QuestionRenderer.tsx**
- Maps `question.type` to the correct component
- Evaluates conditions via `ConditionEngine.ts`
- Hides questions whose conditions fail

### 6.4 Summary — `components/summary/`

**SummaryView.tsx**
- Receives `sections[]` array as prop
- Each section: label (uppercase, small) + value (regular size)
- Separated by thin borders using `--border`
- No hardcoded sections

**PdfExport.tsx**
- Uses `@react-pdf/renderer`
- Generates PDF from rendered SummaryView
- Clean A4 layout with PreDoc logo at top
- Doctor-friendly format

### 6.5 Voice — `components/voice/`

**VoiceRecorder.tsx**
- Big circular record button (pulses when recording)
- Live waveform animation during recording
- Timer counting up (mm:ss format)
- Stop button
- Replay button after recording
- "Done" primary button
- "Skip" ghost button
- Reassuring text: "Speak freely. We'll listen."
- Uses MediaRecorder API

---

## 7. Typography Spec

| Element | Size | Weight | Color |
|---|---|---|---|
| Page title | 28-32px | 600 | `--text-primary` |
| Section header | 20px | 600 | `--text-primary` |
| Body text | 15-16px | 400 | `--text-primary` |
| Helper text | 13-14px | 400 | `--text-secondary` |
| Small / hint | 12-13px | 400 | `--text-hint` |
| Button label | 15px | 500 | varies by variant |

Line height: 1.5 for body, 1.2 for headings.

---

## 8. Spacing Spec

- Card padding: 24px (mobile), 32px (desktop)
- Gap between form elements: 16px
- Gap between list items: 12px
- Button padding: 12px vertical, 24px horizontal
- Section margins: 24px

Use Tailwind spacing classes that map to `--spacing-base`.

---

## 9. What NOT To Do

- No red, orange, or yellow colors (anxiety triggers)
- No stock photos of doctors, hospitals, syringes, pills
- No "diagnosis" language anywhere
- No urgency or fear messaging
- No emojis in body text (allowed only in slider as pain indicators)
- No flashy animations — gentle transitions only
- No hardcoded text inside components — all from props

---

## 10. Component Implementation Rules

When building any component:

1. **Props for content** — every text, icon name, color variant comes from props or API
2. **Tailwind classes only** — never inline styles, never raw color values
3. **TypeScript types** — every prop typed, no `any`
4. **Accessibility** — ARIA labels, keyboard nav, focus states visible
5. **Mobile-first** — write mobile styles first, scale up with `md:` and `lg:` prefixes
6. **No API calls in components** — components receive data via props from hooks
7. **No role checks** — backend navigation controls visibility

---

## 11. Build Order

Build components in this order to enable parallel screen development:

```
1. UI components (Button, Spinner, ErrorMessage)
2. Layout (AppShell, NavBar)
3. Question components (one at a time, TextArea → TextInput → Chips → ...)
4. QuestionRenderer + ConditionEngine
5. Summary components (SummaryView, PdfExport)
6. Voice (VoiceRecorder)
7. Pages (Intro → Auth → Questions → Summary → History)
```

Each component must compile, render in isolation, and pass linting before moving to next.

---

## 12. Reference Section

| Topic | Where to find it |
|---|---|
| Folder structure | PROJECT_MEMORY.md Section 12 |
| API endpoints | PROJECT_MEMORY.md Section 11 |
| Theme variable injection | PROJECT_MEMORY.md Section 8 |
| Question types | PROJECT_MEMORY.md Section 9 |
| Tailwind config | PROJECT_MEMORY.md Section 8 |
| Build steps (38-60) | PROJECT_MEMORY.md Section 15 Phase 2 |

---

*Use this document together with PROJECT_MEMORY.md when building PreDoc UI.*