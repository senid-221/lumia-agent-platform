'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, MapPin, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { api } from '../../lib/api';

type Agent = { id: string; displayName: string; phone: string; location: string; serviceAreas: string[] };

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ agents: Agent[] }>('/api/v1/irembo-agents')
      .then((data) => setAgents(data.agents))
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load agents.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/services" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft size={15}/> Irembo services</Link>
          <Link href="/chat" className="text-sm font-semibold">LUMIA AI</Link>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="max-w-3xl">
          <div className="text-sm font-medium text-slate-500">AVAILABLE AGENTS</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Hitamo agent wagufasha.</h1>
          <p className="mt-3 text-slate-600">Aba ni agents bari muri LUMIA platform kandi bafite status ya verified muri system.</p>
        </div>

        {loading && <div className="mt-10 text-sm text-slate-500">Loading available agents…</div>}
        {error && <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        {!loading && !error && agents.length === 0 && <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Nta verified agent uri available muri system ubu.</div>}

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <div key={agent.id} className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100"><UserRound size={20}/></div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"><ShieldCheck size={13}/> Verified</span>
              </div>
              <h2 className="mt-6 text-lg font-semibold">{agent.displayName}</h2>
              <div className="mt-2 flex items-center gap-1 text-sm text-slate-500"><MapPin size={14}/> {agent.location}</div>
              <div className="mt-4 flex flex-wrap gap-2">{agent.serviceAreas.slice(0,5).map((s)=><span key={s} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{s}</span>)}</div>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                <a href={agent.phone ? 'tel:' + agent.phone : '#'} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-800"><Phone size={14}/> Call</a>
                <Link href="/chat" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3 text-sm font-semibold text-white"><CheckCircle2 size={14}/> Request</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
