import Link from 'next/link';
import { ArrowLeft, Bot, CheckCircle2, ChevronRight, FileText, Landmark, MapPin, Phone, WalletCards } from 'lucide-react';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000').replace(/\/$/, '');

type Agent = { id: string; displayName: string; phone: string; location: string; serviceAreas: string[] };
type Service = {
  id: string; slug: string; name: string; category: string; description?: string | null;
  requirements?: unknown; feeRwf?: number | null; processingTime?: string | null;
  accountRequired?: boolean | null; officialUrl?: string | null;
};

function formatRequirements(value: unknown) {
  if (!value) return 'Ibisabwa ntibirashyirwaho.';
  if (Array.isArray(value)) return value.map(String).join('\n');
  if (typeof value === 'object') return Object.entries(value as Record<string, unknown>).map(([key, val]) => key + ': ' + String(val)).join('\n');
  return String(value);
}

async function getService(slug: string) {
  const response = await fetch(API_URL + '/api/v1/irembo/services/' + encodeURIComponent(slug), { cache: 'no-store' });
  if (!response.ok) return null;
  return response.json() as Promise<{ service: Service; agents: Agent[] }>;
}

export default async function ServiceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getService(decodeURIComponent(id));
  const service = data?.service;
  const agents = data?.agents || [];

  if (!service) {
    return <main className="min-h-screen bg-white p-8 text-slate-900"><Link href="/services" className="text-sm text-sky-600">← Serivisi zose</Link><div className="mx-auto mt-20 max-w-xl text-center"><h1 className="text-2xl font-semibold">Service ntibonetse</h1><p className="mt-2 text-sm text-slate-500">Iyi service ntikiri muri LUMIA catalog.</p></div></main>;
  }

  const chatHref = '/chat?service=' + encodeURIComponent(service.name);
  const requirements = formatRequirements(service.requirements);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/services" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft size={15}/> Serivisi zose</Link>
          <Link href={chatHref} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Ask LUMIA</Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-10">
        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-700 shadow-sm"><Bot size={13}/> LUMIA service</div>
          <div className="mt-5 grid h-11 w-11 place-items-center rounded-full bg-white text-sky-600 shadow"><Landmark size={20}/></div>
          <div className="mt-5 text-xs font-semibold uppercase tracking-[.15em] text-sky-600">{service.category}</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{service.name}</h1>
          {service.description && <p className="mt-3 text-sm leading-6 text-slate-600">{service.description}</p>}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 text-xs text-slate-400"><FileText size={14}/> Ibisabwa</div><div className="mt-3 whitespace-pre-line text-sm text-slate-700">{requirements}</div></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 text-xs text-slate-400"><WalletCards size={14}/> Igiciro</div><div className="mt-3 font-semibold">{service.feeRwf == null ? 'Ntikirashyirwaho' : service.feeRwf.toLocaleString() + ' RWF'}</div><div className="mt-2 text-xs text-slate-500">Igihe: {service.processingTime || 'Ntabwo cyashyizweho'}</div></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 text-xs text-slate-400"><MapPin size={14}/> Available Agents</div><div className="mt-3 font-semibold">{agents.length}</div><div className="mt-2 text-xs text-slate-500">Verified agents bahuye n'iyi service.</div></div>
        </div>

        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 size={17} className="text-emerald-500"/> Available Agents</div>
          {agents.length === 0 ? <p className="mt-4 text-sm text-slate-500">Nta verified agent uri available kuri iyi service ubu.</p> : <div className="mt-4 space-y-2">{agents.map((agent) => <div key={agent.id} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4"><div><div className="font-semibold">{agent.displayName}</div><div className="mt-1 text-xs text-slate-500">{agent.location} · {agent.phone}</div></div><Link href={chatHref} className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white">Request</Link></div>)}</div>}
        </section>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/agents" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800"><Phone size={15}/> Agents</Link>
          <Link href={chatHref} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"><Bot size={15}/> Gusaba service</Link>
        </div>
      </div>
    </main>
  );
}