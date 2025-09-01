"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { ReactNode } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteUser, type User } from "@/lib/api"
import { useActivityLog } from "@/stores/activity-log-store"

type Props = {
  user: User
  trigger: ReactNode
}

export function DeleteUserDialog({ user, trigger }: Props) {
  const queryClient = useQueryClient()
  const addLog = useActivityLog((s) => s.addEntry)

  const mutation = useMutation({
    mutationFn: () => deleteUser(user.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["users"] })
      const prev = queryClient.getQueryData<User[]>(["users"]) || []
      queryClient.setQueryData<User[]>(
        ["users"],
        prev.filter((u) => u.id !== user.id),
      )
      addLog({
        id: crypto.randomUUID(),
        type: "delete",
        message: `Deleted user ${user.name}`,
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

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {user.name}?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutation.mutate()}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
