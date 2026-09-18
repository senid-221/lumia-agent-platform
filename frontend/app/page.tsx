import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="mx-auto flex min-h-[calc(100vh-1px)] max-w-md flex-col items-center justify-center px-6 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-lg font-semibold text-white">L</div>
        <div className="mt-4 text-sm font-semibold tracking-[0.18em]">LUMIA</div>
        <div className="mt-1 text-[10px] font-medium tracking-[0.18em] text-slate-400">AGENT PLATFORM</div>
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">Your AI workspace.</h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Sign in to access LUMIA services, AI tools, Irembo support, agents, and your workspace.</p>
        <div className="mt-6 flex w-full flex-col gap-2">
          <Link href="/login" className="inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Sign in</Link>
          <Link href="/register" className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800">Create account</Link>
        </div>
      </section>
    </main>
  );
}
