import Link from 'next/link';
import { ArrowLeft, ChevronRight, Landmark, Search } from 'lucide-react';

const categories = ['Family', 'Identification', 'Immigration & Emigration', 'Land', 'Car & Motor', 'Health', 'Education', 'Building & Construction', 'Other Services'];
const services = [
  { name: 'Birth Certificate', category: 'Family', detail: 'Official civil registration service' },
  { name: 'Marriage Certificate', category: 'Family', detail: 'Request marriage documentation' },
  { name: 'National ID', category: 'Identification', detail: 'Apply for a national identity service' },
  { name: 'First Land Registration', category: 'Land', detail: 'Register land for the first time' },
  { name: 'Motor Vehicle Inspection', category: 'Car & Motor', detail: 'Book a motor vehicle inspection' },
  { name: 'Visa', category: 'Immigration & Emigration', detail: 'Explore visa application guidance' },
];

export default function ServicesPage() {
  return <main className="min-h-screen bg-slate-50 text-slate-950"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft size={15}/> Dashboard</Link><Link href="/chat" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Ask LUMIA</Link></div></header><div className="mx-auto max-w-7xl px-5 py-10 lg:px-8"><div className="max-w-3xl"><div className="flex items-center gap-2 text-sm font-medium text-slate-500"><Landmark size={16}/> IREMBO SERVICES</div><h1 className="mt-3 text-4xl font-semibold tracking-tight">Find the government service you need.</h1><p className="mt-3 text-slate-600">Browse the LUMIA service directory. Official requirements and fees should always be verified against the current Irembo source.</p></div><div className="mt-8 max-w-xl relative"><Search className="absolute left-3 top-3.5 text-slate-400" size={17}/><input placeholder="Search a service" className="w-full rounded-2xl border border-slate-200 bg-white px-10 py-3.5 text-sm outline-none focus:border-slate-400"/></div><div className="mt-8 flex flex-wrap gap-2">{categories.map(c=><button key={c} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:border-slate-400 hover:text-slate-950">{c}</button>)}</div><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{services.map(service=><Link key={service.name} href="/services" className="group rounded-3xl border border-slate-200 bg-white p-6 hover:shadow-md"><div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{service.category}</div><div className="mt-3 flex items-start justify-between gap-4"><h2 className="text-lg font-semibold">{service.name}</h2><ChevronRight className="mt-1 shrink-0 text-slate-300 group-hover:text-slate-700" size={18}/></div><p className="mt-2 text-sm leading-6 text-slate-500">{service.detail}</p><div className="mt-5 text-xs font-semibold text-slate-700">View service details</div></Link>)}</div></div></main>;
}
