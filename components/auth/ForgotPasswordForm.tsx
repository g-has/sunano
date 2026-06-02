"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { forgotPasswordAction } from "@/app/forgot-password/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const initialState = { error: null as string | null, success: false }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button className="w-full" disabled={pending} type="submit">
      {pending ? "Enviando…" : "Enviar link de redefinição"}
    </Button>
  )
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPasswordAction, initialState)

  if (state.success) {
    return (
      <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-4 text-sm text-green-600 dark:text-green-400">
        Email enviado! Verifique sua caixa de entrada e clique no link para redefinir sua senha.
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="email">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          className="border-border bg-muted/20"
          required
        />
      </div>

      {state.error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <SubmitButton />
    </form>
  )
}
