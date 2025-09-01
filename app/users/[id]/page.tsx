"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchUser } from "@/lib/api"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"

export default function UserDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const router = useRouter()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id),
    enabled: Number.isFinite(id),
    staleTime: 5 * 60 * 1000,
  })

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          Back
        </Button>

        {isLoading && <p>Loading...</p>}
        {isError && <p>Failed to load user.</p>}

        {data && (
          <div className="grid gap-4">
            <h1 className="text-balance text-2xl font-semibold">{data.name}</h1>
            <div className="grid gap-2 rounded-md border p-4">
              <div>
                <span className="font-medium">Email:</span> {data.email}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {data.phone}
              </div>
              <div>
                <span className="font-medium">Company:</span> {data.company?.name}
              </div>
              <div>
                <span className="font-medium">Address:</span>{" "}
                {`${data.address?.street}, ${data.address?.city} ${data.address?.zipcode}`}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
