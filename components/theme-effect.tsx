"use client"

import { useEffect } from "react"
import { useThemeStore } from "@/stores/theme-store"

export function ThemeEffect() {
  const dark = useThemeStore((s) => s.dark)

  useEffect(() => {
    const root = document.documentElement
    if (dark) root.classList.add("dark")
    else root.classList.remove("dark")
  }, [dark])

  return null
}
