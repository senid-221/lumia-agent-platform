'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock3, MapPin, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { api } from '@/lib/api';

type ProviderRequest = {\n  id: string;\n  status: string;\n  customerName: string;\n  customerPhone: string;\n  location: string | null;\n  details: string;\n  createdAt: string;\n  service: { name: string };\n  customer: { email: string };\n};\n\ntype Request = {
  id: string;
  status: string;
  customerName: string;
  customerPhone: string;
  description?: string | null;
  location?: string | null;
  createdAt: string;
  service: { name: string };
  customer: { email: string };
  source?: 'irembo' | 'provider';
  details?: string | null;
};

export default function AgentRequestsPage() {
  const [requests,setRequests]=useState<Request[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState('');

  async function load() {
    const token=localStorage.getItem('lumia_token');
    if(!token){setError('Please log in as an agent.');setLoading(false);return;}
    try{
      const [irembo, provider] = await Promise.all([
        api<{requests:Request[]}>('/api/v1/agent/requests',{headers:{Authorization:'Bearer '+token}}),
        api<{requests:ProviderRequest[]}>('/api/v1/provider/requests',{headers:{Authorization:'Bearer '+token}}).catch(()=>({requests:[]}))
      ]);
      setRequests([
        ...irembo.requests.map(r=>({...r,source:'irembo' as const})),
        ...provider.requests.map(r=>({...r,source:'provider' as const,description:r.details}))
      ].sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()));
    }catch(err){setError(err instanceof Error?err.message:'Unable to load requests.');}
    finally{setLoading(false);}
  }

  useEffect(()=>{void load();},[]);

  async function changeStatus(id:string,status:string){
    const token=localStorage.getItem('lumia_token');
    if(!token) return;
    setBusy(id+status);
    try{
      const current=requests.find(item=>item.id===id);
      if(!current) return;
      const data=current.source==='provider'
        ? await api<{request:Request}>('/api/v1/provider/requests/'+id+'/status',{method:'PATCH',headers:{Authorization:'Bearer '+token},body:JSON.stringify({status})})
        : await api<{request:Request}>('/api/v1/agent/requests/'+id+'/status',{method:'POST',headers:{Authorization:'Bearer '+token},body:JSON.stringify({status})});
      setRequests(items=>items.map(item=>item.id===id?{...item,...data.request,source:current.source}:item));
    }catch(err){setError(err instanceof Error?err.message:'Unable to update request.');}
    finally{setBusy('');}
  }

  return <main className="min-h-screen bg-slate-50 text-slate-950">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft size={15}/> Dashboard</Link><div className="text-sm font-semibold">Agent Workspace</div><Link href="/chat" className="text-sm font-semibold">LUMIA AI</Link></div></header>
    <div className="mx-auto max-w-6xl px-5 py-6">
      <div><div className="text-sm font-medium text-slate-500">AGENT INBOX</div><h1 className="mt-2 text-2xl font-semibold tracking-tight">Service requests</h1><p className="mt-3 text-slate-600">Accept requests, contact customers, and update progress until the service is completed.</p></div>
      {loading&&<div className="mt-5 text-sm text-slate-500">Loading requests…</div>}
      {error&&<div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <div className="mt-5 space-y-4">
        {!loading&&!error&&requests.length===0&&<div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">No assigned requests yet.</div>}
        {requests.map((r)=> <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold">{r.service.name}</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{r.status.replace('_',' ')}</span></div>
              <div className="mt-3 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
                <div className="flex items-center gap-2"><UserRound size={14}/> {r.customerName}</div>
                <div className="flex items-center gap-2"><Phone size={14}/> {r.customerPhone || 'No phone provided'}</div>
                <div className="flex items-center gap-2"><MapPin size={14}/> {r.location || 'Location not provided'}</div>
                <div className="flex items-center gap-2"><Clock3 size={14}/> {new Date(r.createdAt).toLocaleString()}</div>
              </div>
              {r.description&&<p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{r.description}</p>}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {r.customerPhone&&<a href={'tel:'+r.customerPhone} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"><Phone size={13}/> Call</a>}
              {r.status==='MATCHED'&&<button onClick={()=>void changeStatus(r.id,'ACCEPTED')} disabled={busy!==''} className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white">{busy===r.id+'ACCEPTED'?'…':'Accept'}</button>}
              {r.status==='ACCEPTED'&&<button onClick={()=>void changeStatus(r.id,'IN_PROGRESS')} disabled={busy!==''} className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white">{busy===r.id+'IN_PROGRESS'?'…':'Start'}</button>}
              {r.status==='IN_PROGRESS'&&<button onClick={()=>void changeStatus(r.id,'COMPLETED')} disabled={busy!==''} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">{busy===r.id+'COMPLETED'?'…':<><CheckCircle2 size={13}/> Complete</>}</button>}
              {!['COMPLETED','CANCELLED'].includes(r.status)&&<button onClick={()=>void changeStatus(r.id,'CANCELLED')} disabled={busy!==''} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Cancel</button>}
            </div>
          </div>
        </div>)}
      </div>
    </div>
  </main>;
}
