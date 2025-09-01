"use client"

import Link from "next/link"
import { useMemo, useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchUsers } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserFormDialog } from "./user-form-dialog"
import { DeleteUserDialog } from "./delete-user-dialog"
import { ChevronLeft, ChevronRight, Pencil, Trash } from "lucide-react"

function initials(name?: string) {
  if (!name) return "U"
  const parts = name.split(" ").filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : ""
  return (first + last).toUpperCase() || name.slice(0, 2).toUpperCase()
}

type SortDir = "asc" | "desc"

export function UserTable() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,
  })

  const [q, setQ] = useState("")
  const [company, setCompany] = useState<string>("all")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [page, setPage] = useState(1)
  const pageSize = 5

  const prevCountRef = useRef<number>(data.length)
  useEffect(() => {
    if (data.length > prevCountRef.current) {
      setPage(1)
    }
    prevCountRef.current = data.length
  }, [data.length])

  const companies = useMemo(() => {
    const names = Array.from(new Set(data.map((u) => u.company?.name).filter(Boolean)))
    return names
  }, [data])

  const filtered = useMemo(() => {
    let list = data
    if (q.trim()) {
      const qq = q.toLowerCase()
      list = list.filter((u) => u.name.toLowerCase().includes(qq))
    }
    if (company !== "all") {
      list = list.filter((u) => u.company?.name === company)
    }
    return list
  }, [data, q, company])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const ea = a.email.toLowerCase()
      const eb = b.email.toLowerCase()
      if (ea < eb) return sortDir === "asc" ? -1 : 1
      if (ea > eb) return sortDir === "asc" ? 1 : -1
      return 0
    })
  }, [filtered, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageClamped = Math.min(page, totalPages)
  const paged = useMemo(() => {
    const start = (pageClamped - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, pageClamped])

  const goPrev = () => setPage((p) => Math.max(1, p - 1))
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1))

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Search by name..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(1)
            }}
            className="max-w-xs"
          />

          <Select
            value={company}
            onValueChange={(v) => {
              setCompany(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All companies</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c} value={c!}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}>
            Sort by email: {sortDir === "asc" ? "A–Z" : "Z–A"}
          </Button>
        </div>

        <UserFormDialog mode="add" trigger={<Button>Add User</Button>} />
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-[640px] w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="p-3">Avatar</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Company</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="p-3" colSpan={6}>
                  Loading...
                </td>
              </tr>
            )}
            {!isLoading && paged.length === 0 && (
              <tr>
                <td className="p-3" colSpan={6}>
                  No users found.
                </td>
              </tr>
            )}
            {paged.map((u) => (
              <tr key={u.id} className="border-t hover:bg-muted/30">
                <td className="p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-medium">
                    {initials(u.name)}
                  </div>
                </td>
                <td className="p-3">
                  <Link href={`/users/${u.id}`} className="underline-offset-2 hover:underline">
                    {u.name}
                  </Link>
                </td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.phone}</td>
                <td className="p-3">{u.company?.name}</td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-2">
                    <UserFormDialog
                      mode="edit"
                      user={u}
                      trigger={
                        <Button size="icon" variant="outline" aria-label={`Edit ${u.name}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <DeleteUserDialog
                      user={u}
                      trigger={
                        <Button size="icon" variant="destructive" aria-label={`Delete ${u.name}`}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {pageClamped} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goPrev} disabled={pageClamped === 1}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Prev
          </Button>
          <Button variant="outline" onClick={goNext} disabled={pageClamped === totalPages}>
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
