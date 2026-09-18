import Link from 'next/link';
import { ArrowLeft, ExternalLink, Landmark } from 'lucide-react';

const categories: Record<string, string> = {
  'Umuryango': 'Family',
  'Abinjira N’abasohoka': 'Immigration & Emigration',
  'Irangamimerere': 'Identification',
  'Ubutaka': 'Land',
  'Polisi': 'Police',
  'Ubuzima': 'Health',
  'Uburezi': 'Education',
  'Serivisi Zitanga Uruhushya Rwo Kubaka': 'Building & Construction',
};

export default async function ServiceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const label = decodeURIComponent(id).replace(/-/g, ' ');
  const title = label.replace(/\b\w/g, (m) => m.toUpperCase());

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/services" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft size={15}/> Serivisi zose</Link>
          <Link href="/chat" className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Ask LUMIA</Link>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-5 py-10">
        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-6">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-white text-sky-600 shadow"><Landmark size={20}/></div>
          <div className="mt-5 text-xs font-semibold uppercase tracking-[.15em] text-sky-600">IREMBO SERVICE</div>
          <h1 className="mt-2 text-3xl font-semibold capitalize tracking-tight">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Reba ibisobanuro bya serivisi, ibisabwa, amafaranga n’uburyo bwo kuyisaba. Amakuru y’ingenzi agomba kugenzurwa ku rubuga rwa IremboGov ruriho ubu.</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 p-5"><div className="text-xs text-slate-400">Category</div><div className="mt-2 font-semibold">categories[label] ?? "Government service"</div></div>
          <div className="rounded-2xl border border-slate-200 p-5"><div className="text-xs text-slate-400">Source</div><div className="mt-2 font-semibold">IremboGov</div></div>
          <div className="rounded-2xl border border-slate-200 p-5"><div className="text-xs text-slate-400">Help</div><Link href="/chat" className="mt-2 inline-block font-semibold text-sky-700">Ask LUMIA</Link></div>
        </div>
        <a href="https://irembo.gov.rw" target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white">Open IremboGov <ExternalLink size={14}/></a>
      </div>
    </main>
  );
}
