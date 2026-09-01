import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoryVisibility } from '../types/contracts';

export type DraftKind = 'voice' | 'text';

interface DraftState {
  promptKey: string | null;
  kind: DraftKind | null;
  text: string;
  tags: string[];
  visibility: StoryVisibility;
  audioBlobUrl: string | null;
  durationSeconds: number | null;
  lastSavedAt: string | null;
  setKind: (kind: DraftKind, promptKey: string | null) => void;
  setText: (text: string) => void;
  toggleTag: (tag: string) => void;
  setVisibility: (visibility: StoryVisibility) => void;
  setAudio: (blobUrl: string | null, durationSeconds: number | null) => void;
  markSaved: () => void;
  reset: () => void;
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      promptKey: null,
      kind: null,
      text: '',
      tags: [],
      visibility: 'private',
      audioBlobUrl: null,
      durationSeconds: null,
      lastSavedAt: null,
      setKind: (kind, promptKey) => set({ kind, promptKey }),
      setText: (text) => set({ text }),
      toggleTag: (tag) =>
        set((s) => ({
          tags: s.tags.includes(tag) ? s.tags.filter((t) => t !== tag) : [...s.tags, tag],
        })),
      setVisibility: (visibility) => set({ visibility }),
      setAudio: (audioBlobUrl, durationSeconds) =>
        set({ audioBlobUrl, durationSeconds }),
      markSaved: () => set({ lastSavedAt: new Date().toISOString() }),
      reset: () =>
        set({
          promptKey: null,
          kind: null,
          text: '',
          tags: [],
          visibility: 'private',
          audioBlobUrl: null,
          durationSeconds: null,
          lastSavedAt: null,
        }),
    }),
    {
      name: 'theuntold.draft',
      partialize: (s) => ({
        promptKey: s.promptKey,
        kind: s.kind,
        text: s.text,
        tags: s.tags,
        visibility: s.visibility,
        lastSavedAt: s.lastSavedAt,
      }),
    },
  ),
);
