"use client"

import { useActivityLog } from "@/stores/activity-log-store"

export function ActivityLog() {
  const entries = useActivityLog((s) => s.entries)

  if (entries.length === 0) return null

  return (
    <aside className="mt-6 rounded-md border p-4">
      <h2 className="mb-2 text-lg font-semibold">Activity</h2>
      <ul className="space-y-2">
        {entries.map((e) => (
          <li key={e.id} className="text-sm text-muted-foreground">
            <span className="font-medium">{e.type.toUpperCase()}</span> — {e.message}{" "}
            <span className="opacity-70">({new Date(e.at).toLocaleTimeString()})</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
