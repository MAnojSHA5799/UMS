"use client"

import { create } from "zustand"

export type LoggedInUser = {
  id: number
  name: string
  email: string
}

type AuthState = {
  user: LoggedInUser | null
  setUser: (u: LoggedInUser) => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
}))
