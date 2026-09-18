'use client';

import Link from 'next/link';
import { ArrowLeft, BriefcaseBusiness, MapPin, Phone, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const FALLBACK_SERVICES = ['Hair Fashion','Driving Training','Restaurant Bookers','Shopping Orders','Car Repairing','Motor Repairing','Land Survey','Computer Repairing','Boutique Food Ordering','Website Building','Web Hosting','Teaching Tech','Prompt Generation','Flyer & Graphic Design','Jobs for Seekers'];

export default function ProviderRegisterPage() {
  const [displayName,setDisplayName]=useState('');
  const [phone,setPhone]=useState('');
  const [serviceLocation,setServiceLocation]=useState('');
  const [services,setServices]=useState<string[]>([]);
  const [serviceOptions,setServiceOptions]=useState<string[]>(FALLBACK_SERVICES);
  const [bio,setBio]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);

  useEffect(() => {
    const token = localStorage.getItem('lumia_token');
    if (!token) return;
    void api<{ services: Array<{ name: string }> }>('/api/v1/platform/services', { headers: { Authorization: 'Bearer ' + token } })
      .then((data) => setServiceOptions(data.services.map((item) => item.name)))
      .catch(() => setServiceOptions(FALLBACK_SERVICES));
  }, []);

  function toggleService(service:string) {
    setServices(items => items.includes(service) ? items.filter(item=>item!==service) : [...items,service]);
  }

  async function submit(e:React.FormEvent) {
    e.preventDefault(); setError('');
    if (!services.length) { setError('Hitamo service imwe nibura ukora.'); return; }
    const token=localStorage.getItem('lumia_token');
    if (!token) { setError('Banza winjire muri LUMIA.'); return; }
    setLoading(true);
    try {
      await api('/api/v1/irembo-agents/register',{method:'POST',headers:{Authorization:'Bearer '+token},body:JSON.stringify({displayName,phone,location:serviceLocation,serviceAreas:services,bio:bio||undefined})});
      window.location.href='/dashboard';
    } catch(err) { setError(err instanceof Error ? err.message : 'Registration failed.'); }
    finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950">
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft size={15}/> Dashboard</Link>
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white"><BriefcaseBusiness size={21}/></div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Register as a LUMIA Service Provider</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Hitamo service ukora. Registration yawe isuzumwa na admin mbere yo kuboneka ku bakiriya.</p>
        <form onSubmit={submit} className="mt-7 space-y-5">
          <label className="block"><span className="mb-2 block text-sm font-medium">Amazina / Business name</span><div className="relative"><UserRound className="absolute left-3 top-3.5 text-slate-400" size={16}/><input required minLength={2} value={displayName} onChange={e=>setDisplayName(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-10 py-3.5 text-sm outline-none"/></div></label>
          <label className="block"><span className="mb-2 block text-sm font-medium">Phone</span><div className="relative"><Phone className="absolute left-3 top-3.5 text-slate-400" size={16}/><input required minLength={8} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+250..." className="w-full rounded-2xl border border-slate-200 px-10 py-3.5 text-sm outline-none"/></div></label>
          <label className="block"><span className="mb-2 block text-sm font-medium">Location</span><div className="relative"><MapPin className="absolute left-3 top-3.5 text-slate-400" size={16}/><input required minLength={2} value={serviceLocation} onChange={e=>setServiceLocation(e.target.value)} placeholder="Kigali, Gasabo..." className="w-full rounded-2xl border border-slate-200 px-10 py-3.5 text-sm outline-none"/></div></label>
          <div><div className="mb-2 text-sm font-medium">Service ukora</div><div className="grid gap-2 sm:grid-cols-2">{serviceOptions.map(service=><label key={service} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-3 text-sm hover:bg-slate-50"><input type="checkbox" checked={services.includes(service)} onChange={()=>toggleService(service)} className="h-4 w-4"/><span>{service}</span></label>)}</div></div>
          <label className="block"><span className="mb-2 block text-sm font-medium">Description (optional)</span><textarea value={bio} onChange={e=>setBio(e.target.value)} maxLength={1000} rows={4} placeholder="Sobanura service utanga..." className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none"/></label>
          {error&&<div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          <button disabled={loading} className="w-full rounded-2xl bg-slate-950 py-3.5 text-sm font-semibold text-white disabled:opacity-50">{loading?'Submitting…':'Submit provider registration'}</button>
        </form>
      </div>
    </div>
  </main>;
}
