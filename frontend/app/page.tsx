import Link from 'next/link';
import { ArrowRight, Bot, Code2, Globe2, Landmark, Network, Search, Sparkles, Zap } from 'lucide-react';

const features = [
  { icon: Bot, title: 'AI Agent Workspace', text: 'Chat, reason, plan, code, and execute from one place.' },
  { icon: Globe2, title: 'Web Intelligence', text: 'Research current information with live web context.' },
  { icon: Code2, title: 'Build & Code', text: 'Create websites, apps, prompts, and technical solutions.' },
  { icon: Landmark, title: 'Irembo Services', text: 'Discover government services and connect with agents.' },
];

const integrations = [
  { label: 'Gemini', icon: '✦' },
  { label: 'Exa', icon: '⌁' },
  { label: 'Meta', icon: '◉' },
  { label: 'GitHub', icon: '●' },
  { label: 'Irembo', icon: '◆' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950">
      <header className="sticky top-0 z-30 border-b border-violet-100/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white shadow-lg shadow-violet-200"><Sparkles size={16}/></div>
            <div>
              <div className="text-sm font-semibold tracking-[0.16em]">LUMIA</div>
              <div className="text-[10px] font-medium text-slate-400">AGENT PLATFORM</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-slate-500 md:flex">
            <Link href="/chat" className="hover:text-slate-950">AI Workspace</Link>
            <Link href="/services" className="hover:text-slate-950">Irembo</Link>
            <Link href="/agents" className="hover:text-slate-950">Agents</Link>
            <a href="#features" className="hover:text-slate-950">Features</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-xl px-3 py-2 text-sm font-medium text-slate-600 sm:inline-flex">Sign in</Link>
            <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200">Get Started<ArrowRight size={15}/></Link>
          </div>
        </div>
      </header>

      <section className="relative border-b border-violet-100 bg-[linear-gradient(180deg,#c9b5ff_0%,#e6ddff_28%,#f7f3ff_52%,#ffffff_76%)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,.22),transparent_65%)]" />
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-14 lg:px-8 lg:pb-28 lg:pt-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
              <Zap size={14} className="text-violet-600"/> Powered by Gemini + Exa + Meta
            </div>
            <h1 className="text-5xl font-semibold leading-[.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">Seamless Intelligence<br/>Limitless Possibility</h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">One professional AI workspace for learning, coding, research, websites, opportunities, and Irembo services.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/chat" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-300 hover:bg-violet-700">Open Workspace<ArrowRight size={15}/></Link>
              <Link href="/services" className="inline-flex items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur">Explore Irembo</Link>
            </div>
          </div>

          <div className="relative mx-auto mt-14 h-52 max-w-5xl sm:h-64">
            {integrations.map((item, index) => (
              <div key={item.label} className="absolute grid h-20 w-20 place-items-center rounded-3xl border border-white/80 bg-white/55 shadow-xl shadow-violet-100 backdrop-blur-xl sm:h-24 sm:w-24"
                style={{ left: ['3%','24%','46%','68%','86%'][index], top: [18,86,12,86,20][index] }}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800">{item.icon}</div>
                  <div className="mt-1 text-[10px] font-medium text-slate-500">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">Intelligent features</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Everything you need in one AI platform</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">Designed for people who want one place to think, build, search, and get things done.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map(({icon: Icon,title,text}) => (
            <Link key={title} href={title === 'Irembo Services' ? '/services' : '/chat'} className="group rounded-3xl border border-violet-100 bg-white p-6 shadow-[0_16px_50px_rgba(124,58,237,.06)] transition hover:-translate-y-1 hover:border-violet-200">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-50 text-violet-600"><Icon size={19}/></div>
              <h3 className="mt-5 text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
              <div className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-violet-600">Open<ArrowRight size={13}/></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-violet-200 bg-[#17171a] px-5 py-8 shadow-[0_30px_100px_rgba(124,58,237,.18)] sm:px-8 sm:py-10 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-violet-200"><Network size={13}/> LUMIA Workspace</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Ask AI anything. Build with it. Search with it.</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">A focused dark workspace inspired by modern AI products, connected directly to your LUMIA backend.</p>
              <Link href="/chat" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white">Launch workspace<ArrowRight size={15}/></Link>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#202023] p-4 shadow-2xl shadow-black/30">
              <div className="flex gap-4">
                <aside className="hidden w-44 shrink-0 rounded-2xl border border-white/5 bg-[#17171a] p-3 sm:block">
                  <div className="text-sm font-semibold text-white">LUMIA</div>
                  <button className="mt-4 w-full rounded-xl border border-violet-400/50 bg-transparent px-3 py-2 text-xs text-slate-200">+ New Chat</button>
                  <div className="mt-3 space-y-1 text-xs text-slate-400"><div className="rounded-lg bg-white/5 px-3 py-2 text-slate-100">Chat</div><div className="px-3 py-2">Web Search</div><div className="px-3 py-2">Irembo</div></div>
                </aside>
                <div className="min-w-0 flex-1 rounded-2xl bg-[#1b1b1f] px-4 py-7">
                  <div className="mx-auto max-w-xl text-center">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/15 text-violet-300"><Sparkles size={22}/></div>
                    <div className="mt-4 text-sm text-slate-500">Welcome to LUMIA</div>
                    <div className="mt-2 text-2xl font-medium text-slate-100">How can I assist you?</div>
                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {['Build a website','Research a topic','Find an Irembo service'].map((item)=><div key={item} className="rounded-2xl border border-white/10 bg-white/[.02] p-4 text-left text-xs text-slate-400"><Search size={14} className="mb-6 text-slate-500"/>{item}</div>)}
                    </div>
                    <div className="mt-7 rounded-2xl border border-violet-400/50 bg-[#16161a] px-4 py-3 text-left text-xs text-slate-500 shadow-[0_0_45px_rgba(168,85,247,.10)]">Ask LUMIA anything or write your request...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>LUMIA Agent Platform</span><span>Powered by Meta • CeniDev Ltd.</span>
        </div>
      </footer>
    </main>
  );
}
