import { Navbar } from "@/components/navbar"
import { UserTable } from "@/components/user-table"
import { ActivityLog } from "@/components/activity-log"

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="mb-4 text-balance text-2xl font-semibold">Users</h1>
        <UserTable />
        <ActivityLog />
      </section>
    </main>
  )
}
