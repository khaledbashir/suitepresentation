"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Artifact } from "@/types/artifact";

interface ArtifactsState {
  artifacts: Record<string, Artifact>;
  activeArtifactId?: string;
  isPreviewOpen: boolean;
  add: (artifact: Artifact) => void;
  update: (id: string, patch: Partial<Artifact>) => void;
  remove: (id: string) => void;
  setActive: (id?: string) => void;
  openPreview: (id: string) => void;
  closePreview: () => void;
}

export const useArtifactsStore = create<ArtifactsState>()(
  persist(
    (set, get) => ({
      artifacts: {},
      activeArtifactId: undefined,
      isPreviewOpen: false,
      add: (artifact) =>
        set((state) => ({
          artifacts: { ...state.artifacts, [artifact.id]: artifact },
          activeArtifactId: artifact.id,
        })),
      update: (id, patch) =>
        set((state) => ({
          artifacts: {
            ...state.artifacts,
            [id]: { ...(state.artifacts[id] ?? ({} as Artifact)), ...patch, updatedAt: Date.now() },
          },
        })),
      remove: (id) =>
        set((state) => {
          const next = { ...state.artifacts };
          delete next[id];
          let { activeArtifactId } = state;
          if (activeArtifactId === id) activeArtifactId = undefined;
          return { artifacts: next, activeArtifactId };
        }),
      setActive: (id) => set({ activeArtifactId: id }),
      openPreview: (id) => set({ activeArtifactId: id, isPreviewOpen: true }),
      closePreview: () => set({ isPreviewOpen: false }),
    }),
    {
      name: "artifacts-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ artifacts: state.artifacts }), // don't persist UI state
    },
  ),
);

export function getActiveArtifact(): Artifact | undefined {
  const state = useArtifactsStore.getState();
  const id = state.activeArtifactId;
  return id ? state.artifacts[id] : undefined;
}
