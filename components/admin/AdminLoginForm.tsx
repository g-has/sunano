"use client"

import { useRef, useState } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"

import { loginAction } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLocale } from "@/components/providers/locale-context"

const initialState = { error: null as string | null }

const LOGIN_ERROR_MESSAGES = {
  missing_credentials: { en: "Enter email and password.", pt: "Informe email e senha." },
  invalid_credentials: { en: "Invalid credentials.", pt: "Credenciais inválidas." },
  no_admin_access: { en: "Account has no admin access.", pt: "Conta sem acesso ao admin." },
} as const

function LoginSubmitButton({ isEnglish }: { isEnglish: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button className="w-full" disabled={pending} type="submit">
      {pending ? (isEnglish ? "Signing in..." : "Entrando...") : (isEnglish ? "Sign in" : "Entrar")}
    </Button>
  )
}

function ForgotSubmitButton({ isEnglish }: { isEnglish: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button className="w-full" disabled={pending} type="submit">
      {pending
        ? (isEnglish ? "Sending..." : "Enviando...")
        : (isEnglish ? "Send reset link" : "Enviar link de redefinição")}
    </Button>
  )
}

type ForgotModeProps = { isEnglish: boolean; onBack: () => void }

function ForgotMode({ isEnglish, onBack }: ForgotModeProps) {
  const [sent, setSent] = useState(false)
  const [pending, setPending] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()

    if (!trimmed) {
      setError(isEnglish ? "Enter your email." : "Informe seu email.")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(isEnglish ? "Enter a valid email." : "Informe um email válido.")
      return
    }

    setPending(true)
    setError(null)

    try {
      await fetch("/api/admin/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      })
    } catch {
      // silently ignore — always show success to avoid user enumeration
    } finally {
      setPending(false)
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="space-y-5">
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-200">
          {isEnglish
            ? "If the email is registered, you will receive the reset instructions shortly."
            : "Se o email estiver cadastrado, você receberá as instruções em breve."}
        </div>
        <button type="button" onClick={onBack} className="text-xs text-primary hover:underline">
          ← {isEnglish ? "Back to login" : "Voltar ao login"}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-foreground">
          {isEnglish ? "Password reset" : "Redefinição de senha"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {isEnglish
            ? "Enter your account email and we'll send a reset link."
            : "Informe o email da sua conta e enviaremos um link para criar uma nova senha."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="reset-email">
            Email
          </label>
          <Input
            id="reset-email"
            type="email"
            autoComplete="email"
            placeholder="admin@sunano.com"
            className="border-border bg-card/50 text-foreground placeholder:text-muted-foreground"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            required
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        <Button className="w-full" disabled={pending} type="submit">
          {pending
            ? (isEnglish ? "Sending..." : "Enviando...")
            : (isEnglish ? "Send reset link" : "Enviar link de redefinição")}
        </Button>
      </form>

      <button type="button" onClick={onBack} className="text-xs text-primary hover:underline">
        ← {isEnglish ? "Back to login" : "Voltar ao login"}
      </button>
    </div>
  )
}

export function AdminLoginForm() {
  const { locale } = useLocale()
  const isEnglish = locale === "en-US"
  const [mode, setMode] = useState<"login" | "forgot">("login")
  const [state, formAction] = useActionState(loginAction, initialState)

  const localizedError = state.error
    ? LOGIN_ERROR_MESSAGES[state.error as keyof typeof LOGIN_ERROR_MESSAGES]
      ? isEnglish
        ? LOGIN_ERROR_MESSAGES[state.error as keyof typeof LOGIN_ERROR_MESSAGES].en
        : LOGIN_ERROR_MESSAGES[state.error as keyof typeof LOGIN_ERROR_MESSAGES].pt
      : state.error
    : null

  if (mode === "forgot") {
    return <ForgotMode isEnglish={isEnglish} onBack={() => setMode("login")} />
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="email">
          Email
        </label>
        <Input
          autoComplete="email"
          className="border-border bg-card/50 text-foreground placeholder:text-muted-foreground"
          id="email"
          name="email"
          placeholder="admin@sunano.com"
          type="email"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="password">
          {isEnglish ? "Password" : "Senha"}
        </label>
        <Input
          autoComplete="current-password"
          className="border-border bg-card/50 text-foreground placeholder:text-muted-foreground"
          id="password"
          name="password"
          placeholder={isEnglish ? "Your password" : "Sua senha"}
          type="password"
        />
      </div>

      {localizedError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {localizedError}
        </div>
      )}

      <LoginSubmitButton isEnglish={isEnglish} />

      <Button
        className="w-full"
        type="button"
        variant="ghost"
        onClick={() => setMode("forgot")}
      >
        {isEnglish ? "Forgot my password" : "Esqueci minha senha"}
      </Button>
    </form>
  )
}
