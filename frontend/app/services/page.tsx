'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight, ExternalLink, Landmark, Search } from 'lucide-react';
import { api } from '../../lib/api';

type Service = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description?: string | null;
  feeRwf?: number | null;
  processingTime?: string | null;
};

function slugify(value: string) {
  return encodeURIComponent(value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-'));
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ services: Service[] }>('/api/v1/irembo/services')
      .then((data) => setServices(data.services))
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load services.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => [...new Set(services.map((service) => service.category))], [services]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((service) =>
      (active === 'All' || service.category === active) &&
      (!q || service.name.toLowerCase().includes(q) || service.category.toLowerCase().includes(q))
    );
  }, [services, query, active]);

  return (
    <main className="min-h-screen bg-white text-slate-800">
      <section className="bg-[linear-gradient(135deg,#0488df,#0d78cf_55%,#1672c9)] px-5 pb-10 pt-6 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"><ArrowLeft size={16}/> Dashboard</Link>
            <Link href="/chat" className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/20">Ask LUMIA</Link>
          </div>
          <div className="mx-auto max-w-xl pt-8 text-center">
            <div className="text-3xl font-semibold tracking-tight">Irembo Services</div>
            <p className="mt-2 text-sm text-white/75">Serivisi ziri muri LUMIA catalog</p>
            <div className="relative mt-5">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={16}/>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Gushakisha serivisi" className="w-full rounded-md border-0 bg-white px-11 py-3 text-sm text-slate-800 shadow-lg outline-none placeholder:text-slate-400"/>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-9">
        <div className="rounded-xl border border-sky-100 bg-sky-50 px-5 py-5">
          <div className="flex gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-sky-600 shadow"><Landmark size={20}/></div>
            <div><h2 className="font-semibold text-slate-800">LUMIA Service Catalog</h2><p className="mt-1 text-sm leading-6 text-slate-600">Amakuru ya service, ibisabwa, ibiciro n'abafasha biboneka muri system.</p></div>
            <a href="https://irembo.gov.rw" target="_blank" rel="noreferrer" className="ml-auto hidden shrink-0 self-center items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white sm:inline-flex">IremboGov <ExternalLink size={14}/></a>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <div><div className="text-sm font-semibold text-slate-700">Services</div><div className="text-xs text-slate-400">{filtered.length} / {services.length}</div></div>
          <div className="relative">
            <select value={active} onChange={(e) => setActive(e.target.value)} className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-xs text-slate-600 outline-none">
              <option>All</option>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 text-slate-400" size={14}/>
          </div>
        </div>

        {loading && <div className="mt-5 rounded-xl border border-slate-200 p-5 text-sm text-slate-500">Loading services…</div>}
        {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>}
        {!loading && !error && filtered.length === 0 && <div className="mt-5 rounded-xl border border-slate-200 p-5 text-sm text-slate-500">Nta service ibonetse.</div>}

        <div className="mt-5 divide-y divide-slate-100">
          {filtered.map((service) => (
            <Link key={service.id} href={'/services/' + slugify(service.name)} className="flex items-center justify-between gap-4 py-4 group">
              <div>
                <div className="text-sm font-semibold text-slate-700 group-hover:text-sky-700">{service.name}</div>
                <div className="mt-1 text-xs text-slate-400">{service.category}{service.feeRwf != null ? ' · ' + service.feeRwf.toLocaleString() + ' RWF' : ''}{service.processingTime ? ' · ' + service.processingTime : ''}</div>
              </div>
              <ChevronRight size={16} className="shrink-0 text-sky-400"/>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}