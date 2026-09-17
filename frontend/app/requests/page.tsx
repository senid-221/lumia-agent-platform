import Link from 'next/link';
import { ArrowLeft, Clock3, FileText, UserRound } from 'lucide-react';

const requests = [
  { service: 'Birth Certificate', status: 'Pending', date: 'Just started', agent: 'Not assigned' },
  { service: 'Land Service', status: 'Matched', date: 'Recently', agent: 'Irembo Service Partner' },
];

export default function RequestsPage() {
  return <main className="min-h-screen bg-slate-50 text-slate-950"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft size={15}/> Dashboard</Link><div className="text-sm font-semibold">My requests</div><div className="w-20"/></div></header><div className="mx-auto max-w-5xl px-5 py-10"><div><div className="text-sm font-medium text-slate-500">SERVICE REQUESTS</div><h1 className="mt-2 text-4xl font-semibold tracking-tight">Track your requests.</h1><p className="mt-3 text-slate-600">See the current state of services you asked LUMIA or an agent to help with.</p></div><div className="mt-8 space-y-3">{requests.map(r=><div key={r.service} className="rounded-3xl border border-slate-200 bg-white p-6"><div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div className="flex items-start gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-100"><FileText size={18}/></div><div><h2 className="font-semibold">{r.service}</h2><div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500"><span className="inline-flex items-center gap-1"><Clock3 size={13}/>{r.date}</span><span className="inline-flex items-center gap-1"><UserRound size={13}/>{r.agent}</span></div></div></div><span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold">{r.status}</span></div></div>)}</div></div></main>;
}
