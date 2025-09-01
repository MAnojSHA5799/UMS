"use client"

import type React from "react"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createUser, updateUser, type User } from "@/lib/api"
import { useActivityLog } from "@/stores/activity-log-store"

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  company: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

type Props = {
  mode: "add" | "edit"
  user?: User
  trigger: React.ReactNode
}

export function UserFormDialog({ mode, user, trigger }: Props) {
  const queryClient = useQueryClient()
  const addLog = useActivityLog((s) => s.addEntry)

  const defaultValues: FormValues = useMemo(
    () => ({
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      company: user?.company?.name ?? "",
    }),
    [user],
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange",
  })

  const createMutation = useMutation({
    mutationFn: (values: FormValues) =>
      createUser({
        name: values.name,
        email: values.email,
        phone: values.phone,
        company: { name: values.company } as any,
      }),
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: ["users"] })
      const prev = queryClient.getQueryData<User[]>(["users"]) || []
      const optimistic: User = {
        id: Math.max(101, ...prev.map((u) => u.id)) + 1,
        name: values.name,
        email: values.email,
        phone: values.phone,
        username: "",
        website: "",
        company: { name: values.company },
        address: { street: "", suite: "", city: "", zipcode: "" },
      }
      queryClient.setQueryData<User[]>(["users"], [optimistic, ...prev])
      addLog({
        id: crypto.randomUUID(),
        type: "add",
        message: `Added user ${values.name}`,
        at: Date.now(),
      })
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["users"], ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const editMutation = useMutation({
    mutationFn: (values: FormValues) =>
      updateUser(user!.id, {
        name: values.name,
        email: values.email,
        phone: values.phone,
        company: { name: values.company } as any,
      }),
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: ["users"] })
      const prev = queryClient.getQueryData<User[]>(["users"]) || []
      const next = prev.map((u) =>
        u.id === user!.id
          ? {
              ...u,
              name: values.name,
              email: values.email,
              phone: values.phone,
              company: { name: values.company } as any,
            }
          : u,
      )
      queryClient.setQueryData<User[]>(["users"], next)
      addLog({
        id: crypto.randomUUID(),
        type: "edit",
        message: `Edited user ${values.name}`,
        at: Date.now(),
      })
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["users"], ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const onSubmit = (values: FormValues) => {
    if (mode === "add") createMutation.mutate(values)
    else editMutation.mutate(values)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add User" : "Edit User"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm">Name</label>
            <Input {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm">Email</label>
            <Input type="email" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm">Phone</label>
            <Input {...form.register("phone")} />
            {form.formState.errors.phone && (
              <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm">Company</label>
            <Input {...form.register("company")} />
            {form.formState.errors.company && (
              <p className="text-sm text-destructive">{form.formState.errors.company.message}</p>
            )}
          </div>

          <DialogFooter className="mt-2">
            <Button type="submit" disabled={createMutation.isPending || editMutation.isPending}>
              {mode === "add" ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
