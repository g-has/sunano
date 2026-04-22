"use client"

import { AdminLoginForm } from "@/components/admin/AdminLoginForm"
import { useLocale } from "@/lib/locale-context"

export default function AdminLoginPage() {
  const { locale } = useLocale()
  const isEnglish = locale === "en-US"

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0d14] px-4 py-10 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-6xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0d1117] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_28%)]" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200">
                <span className="size-2 rounded-full bg-cyan-300" />
                {isEnglish ? "Administrative access" : "Acesso administrativo"}
              </div>

              <div className="space-y-3">
                <h1 className="max-w-xl font-display text-4xl font-bold tracking-tight text-slate-50 md:text-5xl">
                  {isEnglish ? "Access the administration panel." : "Acesso ao painel administrativo."}
                </h1>
                <p className="max-w-xl text-base leading-7 text-slate-400">
                  {isEnglish
                    ? "Sign in with your account to manage the website securely. If needed, you can also request a new access by email."
                    : "Entre com sua conta para cuidar do site com segurança. Se precisar, você também pode pedir um novo acesso por email."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-full rounded-3xl border border-white/[0.08] bg-[#0d1117] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
              <div className="mb-6 space-y-2">
                <h2 className="text-2xl font-semibold text-slate-50">{isEnglish ? "Admin sign in" : "Entrar no admin"}</h2>
                <p className="text-sm text-slate-400">{isEnglish ? "Use the email and password registered in Supabase Auth." : "Use o email e a senha cadastrados no Supabase Auth."}</p>
              </div>

              <AdminLoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}