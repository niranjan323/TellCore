export type UserType = 'guest' | 'registered' | 'paid';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userType: UserType;
  userId: string;
  email: string | null;
}

export interface ProductConfigResponse {
  slug: string;
  name: string;
  defaultLanguage: string;
  defaultThemeSlug: string | null;
  defaultFormSetSlug: string | null;
  supportedLanguages: string[];
}

export interface ThemeResponse {
  slug: string;
  name: string;
  variables: Record<string, string>;
}

export interface NavigationItemResponse {
  key: string;
  label: string;
  route: string;
  icon: string | null;
  order: number;
}

export interface NavigationResponse {
  items: NavigationItemResponse[];
}

export interface QuestionOptionResponse {
  value: string;
  label: string;
  order: number;
}

export interface QuestionConditionResponse {
  dependsOnKey: string;
  operator: string;
  valuesJson: string;
}

export interface QuestionResponse {
  id: string;
  key: string;
  type: string;
  order: number;
  isRequired: boolean;
  group: string | null;
  label: string;
  placeholder: string | null;
  helpText: string | null;
  config: unknown;
  options: QuestionOptionResponse[];
  conditions: QuestionConditionResponse[];
}

export interface IntroResponse {
  id: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  audioUrl: string | null;
  iconKey: string | null;
  primaryButtonLabel: string | null;
  primaryButtonRoute: string | null;
  voiceNoteEnabled: boolean;
}

export interface FormSetResponse {
  formSetId: string;
  slug: string;
  name: string;
  languageCode: string;
  intro: IntroResponse | null;
  questions: QuestionResponse[];
}

export interface CreateSessionRequest {
  productSlug: string;
  formSetId: string;
  languageCode: string;
}

export interface SessionResponse {
  sessionId: string;
}

export interface VoiceUploadResponse {
  voiceNoteUrl: string;
}

export interface SubmitResponseRequest {
  sessionId: string;
  formSetId: string;
  languageCode: string;
  answers: Record<string, unknown>;
  voiceNoteUrl: string | null;
}

export interface SummarySection {
  key: string;
  title: string;
  body: string;
  order: number;
}

export interface SummaryResponse {
  sessionId: string;
  title: string;
  subtitle: string | null;
  disclaimer: string | null;
  sections: SummarySection[];
  isAiGenerated: boolean;
  generatedAt: string;
}

export interface UserResponse {
  userId: string;
  userType: UserType;
  email: string | null;
  name: string | null;
  preferredLanguage: string | null;
}

// ----------------------------------------------------------------------------
// TheUntold-specific domain models.
// These are NOT yet served by CoreBackend. The frontend reads them from
// `data/storyFixtures.ts` until the backend grows Stories / Streaks / Featured
// endpoints. Keep the shape stable so the swap is one file.
// ----------------------------------------------------------------------------

export type StoryKind = 'voice' | 'text';
export type StoryVisibility = 'private' | 'family' | 'community';

export interface Author {
  id: string;
  name: string;
  avatarUrl: string | null;
  initials: string;
}

export interface Story {
  id: string;
  author: Author;
  title: string;
  excerpt: string;
  body: string;
  kind: StoryKind;
  audioUrl: string | null;
  durationSeconds: number | null;
  wordCount: number;
  tags: string[];
  createdAt: string;
  promptKey: string | null;
  isFeatured: boolean;
  heartCount: number;
  visibility: StoryVisibility;
}

export interface DailyPrompt {
  key: string;
  question: string;
  helper: string | null;
  dateLabel: string;
}

export interface Streak {
  currentDays: number;
  longestDays: number;
  weekProgress: boolean[];
  lastEntryAt: string | null;
}

export interface Milestone {
  key: string;
  label: string;
  achievedAt: string | null;
  icon: string;
  highlight: boolean;
}

export interface ProfileStats {
  totalStories: number;
  daysActive: number;
  wordsWritten: number;
  featuredCount: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  status: 'invited' | 'active';
  avatarUrl: string | null;
}

export interface TimeCapsule {
  id: string;
  title: string;
  unlocksOn: string;
  storyIds: string[];
}

export type NotificationKind =
  | 'daily-prompt'
  | 'story-featured'
  | 'story-loved'
  | 'family-shared';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}
