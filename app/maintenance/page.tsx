import Link from "next/link"

export default function MaintenancePage() {
  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-[#090b10] px-6 py-10 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.14),transparent_32%)]" />

      <section className="relative w-full max-w-3xl flex-col items-center rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center shadow-[0_28px_80px_rgba(0,0,0,0.35)] backdrop-blur">
        <p className="mb-4 rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
          Modo Manutenção
        </p>

        <h1 className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
          Estamos ajustando o site
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
          O conteúdo público está temporariamente indisponível enquanto realizamos melhorias.
          Administradores autenticados continuam com acesso normal.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/admin/login"
            className="rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
          >
            Entrar como admin
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            Tentar novamente
          </Link>
        </div>
      </section>
    </main>
  )
}