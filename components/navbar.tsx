"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useThemeStore } from "@/stores/theme-store"
import { useAuthStore } from "@/stores/auth-store"
import { useQuery } from "@tanstack/react-query"
import { fetchUsers } from "@/lib/api"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"

function initials(name?: string) {
  if (!name) return "U"
  const parts = name.split(" ").filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : ""
  return (first + last).toUpperCase() || name.slice(0, 2).toUpperCase()
}

export function Navbar() {
  const dark = useThemeStore((s) => s.dark)
  const setDark = useThemeStore((s) => s.setDark)
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const { data } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (!user && data) {
      const u = data.find((x) => x.id === 1)
      if (u) setUser({ id: u.id, name: u.name, email: u.email })
    }
  }, [data, user, setUser])

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold">
          User Management
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Dark</span>
            <Switch checked={dark} onCheckedChange={setDark} aria-label="Toggle dark mode" />
          </div>

          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials(user?.name)}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div className="font-medium leading-5">{user?.name ?? "Loading..."}</div>
              <div className="text-muted-foreground leading-5">{user?.email ?? ""}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
