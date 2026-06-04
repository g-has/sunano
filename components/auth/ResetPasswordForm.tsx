"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { resetPasswordAction } from "@/app/reset-password/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const initialState = { error: null as string | null }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button className="w-full" disabled={pending} type="submit">
      {pending ? "Salvando…" : "Salvar nova senha"}
    </Button>
  )
}

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="password">
          Nova senha
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          className="border-border bg-muted/20"
          required
          minLength={8}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="confirm">
          Confirmar nova senha
        </label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          placeholder="Repita a senha"
          className="border-border bg-muted/20"
          required
          minLength={8}
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
