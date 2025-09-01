"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

type ThemeState = {
  dark: boolean
  setDark: (v: boolean) => void
  toggle: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      dark: false,
      setDark: (v) => set({ dark: v }),
      toggle: () => set((s) => ({ dark: !s.dark })),
    }),
    { name: "um-theme" },
  ),
)
