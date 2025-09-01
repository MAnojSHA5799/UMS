"use client"

import { create } from "zustand"

export type ActivityEntry = {
  id: string
  type: "add" | "edit" | "delete"
  message: string
  at: number
}

type ActivityLogState = {
  entries: ActivityEntry[]
  addEntry: (e: ActivityEntry) => void
  clear: () => void
}

export const useActivityLog = create<ActivityLogState>()((set) => ({
  entries: [],
  addEntry: (e) => set((s) => ({ entries: [e, ...s.entries] })),
  clear: () => set({ entries: [] }),
}))
