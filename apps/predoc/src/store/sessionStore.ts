import { create } from 'zustand';
import type { SummaryResponse } from '../types/contracts';

interface SessionState {
  sessionId: string | null;
  formSetId: string | null;
  formSetSlug: string | null;
  languageCode: string;
  voiceNoteUrl: string | null;
  answers: Record<string, unknown>;
  currentStep: number;
  summary: SummaryResponse | null;

  startSession: (input: {
    sessionId: string;
    formSetId: string;
    formSetSlug: string;
    languageCode: string;
  }) => void;
  setLanguage: (lang: string) => void;
  setAnswer: (key: string, value: unknown) => void;
  setVoiceNoteUrl: (url: string | null) => void;
  setStep: (step: number) => void;
  setSummary: (summary: SummaryResponse | null) => void;
  reset: () => void;
}

const initialState = {
  sessionId: null,
  formSetId: null,
  formSetSlug: null,
  languageCode: 'en',
  voiceNoteUrl: null,
  answers: {} as Record<string, unknown>,
  currentStep: 0,
  summary: null as SummaryResponse | null,
};

export const useSessionStore = create<SessionState>((set) => ({
  ...initialState,
  startSession: ({ sessionId, formSetId, formSetSlug, languageCode }) =>
    set({
      sessionId,
      formSetId,
      formSetSlug,
      languageCode,
      voiceNoteUrl: null,
      answers: {},
      currentStep: 0,
      summary: null,
    }),
  setLanguage: (lang) => set({ languageCode: lang }),
  setAnswer: (key, value) =>
    set((state) => ({ answers: { ...state.answers, [key]: value } })),
  setVoiceNoteUrl: (url) => set({ voiceNoteUrl: url }),
  setStep: (step) => set({ currentStep: step }),
  setSummary: (summary) => set({ summary }),
  reset: () => set(initialState),
}));
