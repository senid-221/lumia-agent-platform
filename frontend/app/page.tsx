import Link from 'next/link';
import { ArrowRight, Bot, BriefcaseBusiness, Code2, GraduationCap, Landmark, Search, ShieldCheck, Sparkles } from 'lucide-react';

const capabilities = [
  { icon: Bot, title: 'LUMIA AI', text: 'Ask, learn, build, research, and get guided through tasks.' },
  { icon: Landmark, title: 'Irembo services', text: 'Explore services, requirements, fees, and connect with agents.' },
  { icon: Code2, title: 'Coding & websites', text: 'Turn ideas into practical code, websites, and product plans.' },
  { icon: BriefcaseBusiness, title: 'Jobs & opportunities', text: 'Discover relevant opportunities and get application guidance.' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white"><Sparkles size={19} /></div>
            <div>
              <div className="text-sm font-semibold tracking-[0.18em]">LUMIA</div>
              <div className="text-[11px] text-slate-500">AGENT PLATFORM</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-slate-600 md:flex">
            <Link href="/services" className="hover:text-slate-950">Irembo</Link>
            <Link href="/agents" className="hover:text-slate-950">Agents</Link>
            <Link href="/login" className="hover:text-slate-950">Sign in</Link>
          </nav>
          <Link href="/register" className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white">Get started</Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.15fr_.85fr] lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"><ShieldCheck size={14} /> Powered by Meta • CeniDev Ltd.</div>
            <h1 className="text-5xl font-semibold leading-[1.03] tracking-[-0.04em] sm:text-6xl lg:text-7xl">One intelligent platform for getting things done online.</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">LUMIA brings AI assistance, learning, coding, web intelligence, opportunities, and Irembo guidance into one clean workspace.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white">Start with LUMIA <ArrowRight size={16} /></Link>
              <Link href="/services" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800">Explore Irembo</Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
            <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.18em] text-slate-400">LUMIA workspace</span>
                <Bot size={18} />
              </div>
              <div className="mt-16 text-2xl font-semibold">What can we work on today?</div>
              <div className="mt-3 text-sm leading-6 text-slate-400">Learn something. Build something. Find something. Or get help with an Irembo service.</div>
              <div className="mt-8 grid gap-3">
                {['Help me build a website', 'Find an Irembo service', 'Help me learn coding'].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">{item}</div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold text-slate-500">BUILT AROUND REAL TASKS</div>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">A single place for the work that matters.</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {capabilities.map(({ icon: Icon, title, text }) => <div key={title} className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100"><Icon size={19} /></div>
            <h3 className="mt-6 text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
          </div>)}
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <div className="text-sm text-slate-400">READY WHEN YOU ARE</div>
            <div className="mt-2 text-3xl font-semibold tracking-[-0.03em]">Create your LUMIA account.</div>
          </div>
          <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950">Get started <ArrowRight size={16} /></Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>LUMIA Agent Platform</div>
          <div>Powered by Meta • CeniDev Ltd.</div>
        </div>
      </footer>
    </main>
  );
}
