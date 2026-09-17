import Link from 'next/link';
import { ArrowLeft, MapPin, ShieldCheck, UserRound } from 'lucide-react';

const agents = [
  { name: 'Irembo Service Partner', location: 'Kigali', services: 'Identification · Family · Land', status: 'Verified' },
  { name: 'Digital Government Agent', location: 'Gasabo', services: 'Immigration · Vehicle · Other', status: 'Verified' },
  { name: 'Community Service Agent', location: 'Kicukiro', services: 'Family · Health · Education', status: 'Verified' },
];

export default function AgentsPage() {
  return <main className="min-h-screen bg-slate-50 text-slate-950"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft size={15}/> Dashboard</Link><Link href="/services" className="text-sm font-semibold">Irembo services</Link></div></header><div className="mx-auto max-w-7xl px-5 py-10 lg:px-8"><div className="max-w-3xl"><div className="text-sm font-medium text-slate-500">IREMBO AGENTS</div><h1 className="mt-3 text-4xl font-semibold tracking-tight">Connect with an agent.</h1><p className="mt-3 text-slate-600">Browse verified agents available on the LUMIA platform. LUMIA membership does not itself certify an agent as an official Irembo agent.</p></div><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{agents.map(agent=><div key={agent.name} className="rounded-3xl border border-slate-200 bg-white p-6"><div className="flex items-start justify-between"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100"><UserRound size={20}/></div><span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold"><ShieldCheck size={13}/> {agent.status}</span></div><h2 className="mt-6 text-lg font-semibold">{agent.name}</h2><div className="mt-2 flex items-center gap-1 text-sm text-slate-500"><MapPin size={14}/> {agent.location}</div><p className="mt-4 text-sm leading-6 text-slate-500">{agent.services}</p><button className="mt-6 w-full rounded-2xl bg-slate-950 py-3 text-sm font-semibold text-white">Request help</button></div>)}</div></div></main>;
}
