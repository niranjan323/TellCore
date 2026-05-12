export type UserType = 'guest' | 'registered' | 'paid';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userType: UserType;
  userId: string;
  email: string | null;
}

export interface GuestAuthRequest {
  deviceToken: string | null;
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
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

export type QuestionType =
  | 'textarea'
  | 'textinput'
  | 'chips'
  | 'radio'
  | 'checkbox'
  | 'bodymap'
  | 'slider'
  | 'datepicker'
  | 'infoblock';

export interface QuestionOptionResponse {
  value: string;
  label: string;
  order: number;
}

export interface QuestionConditionResponse {
  dependsOnKey: string;
  operator: 'in' | 'not_in' | 'equals' | 'not_equals' | string;
  valuesJson: string;
}

export interface QuestionResponse {
  id: string;
  key: string;
  type: QuestionType | string;
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

export interface SessionHistoryItem {
  sessionId: string;
  productSlug: string;
  formSetSlug: string;
  languageCode: string;
  status: string;
  title: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface SessionHistoryResponse {
  sessions: SessionHistoryItem[];
}

export interface UserResponse {
  userId: string;
  userType: UserType;
  email: string | null;
  name: string | null;
  preferredLanguage: string | null;
}

export interface SettingResponse {
  key: string;
  value: string;
  dataType: 'string' | 'bool' | 'int' | 'json' | string;
}
