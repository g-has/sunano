"use client"

import { useState } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"

import { loginUserAction } from "@/app/login/actions"
import { forgotPasswordAction } from "@/app/forgot-password/actions"
import { supabaseAuth } from "@/lib/client/supabase-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const LOGIN_ERRORS: Record<string, string> = {
  missing_credentials: "Informe email e senha.",
  invalid_credentials: "Email ou senha incorretos.",
}

function LoginSubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button className="w-full" disabled={pending} type="submit">
      {pending ? "Entrando…" : "Entrar"}
    </Button>
  )
}

function ForgotSubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button className="w-full" disabled={pending} type="submit">
      {pending ? "Enviando…" : "Enviar link de redefinição"}
    </Button>
  )
}

function ForgotMode({ onBack }: { onBack: () => void }) {
  const [state, action] = useActionState(forgotPasswordAction, { error: null, success: false })

  if (state.success) {
    return (
      <div className="space-y-5">
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-4 text-sm text-green-600 dark:text-green-400">
          Se o email estiver cadastrado, você receberá as instruções para redefinir sua senha em breve.
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-primary hover:underline"
        >
          ← Voltar ao login
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-foreground">Redefinição de senha</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Informe o email da sua conta e enviaremos um link para criar uma nova senha.
        </p>
      </div>

      <form action={action} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="forgot-email">
            Email
          </label>
          <Input
            id="forgot-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            className="border-border bg-muted/20"
            required
            autoFocus
          />
        </div>

        {state.error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </div>
        )}

        <ForgotSubmitButton />
      </form>

      <button
        type="button"
        onClick={onBack}
        className="text-xs text-primary hover:underline"
      >
        ← Voltar ao login
      </button>
    </div>
  )
}

export function UserLoginForm() {
  const [mode, setMode] = useState<"login" | "forgot">("login")
  const [loginState, loginAction] = useActionState(loginUserAction, { error: null })

  const errorMessage = loginState.error
    ? (LOGIN_ERRORS[loginState.error] ?? loginState.error)
    : null

  async function handleGoogleLogin() {
    await supabaseAuth.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/forum`,
      },
    })
  }

  if (mode === "forgot") {
    return <ForgotMode onBack={() => setMode("login")} />
  }

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-muted/20 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
      >
        <svg className="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continuar com Google
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-3 text-xs text-muted-foreground">ou</span>
        </div>
      </div>

      <form action={loginAction} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="email">Email</label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            className="border-border bg-muted/20"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground" htmlFor="password">Senha</label>
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="text-xs text-primary hover:underline"
            >
              Esqueceu a senha?
            </button>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Sua senha"
            className="border-border bg-muted/20"
          />
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        <LoginSubmitButton />
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Área administrativa?{" "}
        <Link href="/admin/login" className="text-primary hover:underline">
          Acesso admin
        </Link>
      </p>
    </div>
  )
}
