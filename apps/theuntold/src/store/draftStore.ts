import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DraftKind = 'voice' | 'text';

interface DraftState {
  promptKey: string | null;
  kind: DraftKind | null;
  text: string;
  tags: string[];
  audioBlobUrl: string | null;
  durationSeconds: number | null;
  lastSavedAt: string | null;
  setKind: (kind: DraftKind, promptKey: string | null) => void;
  setText: (text: string) => void;
  toggleTag: (tag: string) => void;
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
      audioBlobUrl: null,
      durationSeconds: null,
      lastSavedAt: null,
      setKind: (kind, promptKey) => set({ kind, promptKey }),
      setText: (text) => set({ text }),
      toggleTag: (tag) =>
        set((s) => ({
          tags: s.tags.includes(tag) ? s.tags.filter((t) => t !== tag) : [...s.tags, tag],
        })),
      setAudio: (audioBlobUrl, durationSeconds) =>
        set({ audioBlobUrl, durationSeconds }),
      markSaved: () => set({ lastSavedAt: new Date().toISOString() }),
      reset: () =>
        set({
          promptKey: null,
          kind: null,
          text: '',
          tags: [],
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
        lastSavedAt: s.lastSavedAt,
      }),
    },
  ),
);
