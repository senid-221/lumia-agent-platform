'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Search, ShoppingBag, Store, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';

type Product = { id:string; name:string; category:string; description:string|null; priceRwf:number|null; imageUrl:string|null; productUrl:string|null; sourceShop:string|null; sourceUrl:string|null; verifiedAt:string|null; stock:number; partner:{businessName:string; location:string} };

const categories = ['Clothing','Furniture','T-shirts','Laptops','Desktops','Mobile Phones','Flat Screens','Screen protectors','Mobile covers','Keypad phones','Solar panels','Car wheels','Motor wheels','Football','Bulbs','Multi-sockets','Caps','Tables','Chairs','Bags','Jumpers','Websites','Mobile apps','Masonry equipment','Medicine','Body oil','Toys'];

export default function MarketplacePage() {
  const [products,setProducts]=useState<Product[]>([]);
  const [search,setSearch]=useState('');
  const [category,setCategory]=useState('');
  const [loading,setLoading]=useState(true);

  async function load() {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if(search.trim()) q.set('search',search.trim());
      if(category) q.set('category',category);
      const data=await api<{products:Product[]}>('/api/v1/marketplace/products?'+q.toString());
      setProducts(data.products);
    } finally { setLoading(false); }
  }
  useEffect(()=>{ const t=setTimeout(()=>void load(),250); return()=>clearTimeout(t); },[search,category]);

  return <main className="min-h-screen bg-slate-50 text-slate-950">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="text-sm font-bold tracking-[.18em]">LUMIA MARKETPLACE</Link>
        <div className="flex gap-2"><Link href="/partner/register" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold">Become a partner</Link><Link href="/dashboard" className="rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white">Dashboard</Link></div>
      </div>
    </header>
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <div className="max-w-3xl"><div className="flex items-center gap-2 text-sm text-violet-600"><ShoppingBag size={16}/> Marketplace</div><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Products and services from approved LUMIA partners.</h1><p className="mt-3 text-slate-600">Products appear here only after a partner has been approved and listed the item.</p></div>
      <div className="mt-7 flex flex-col gap-3 lg:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3.5 text-slate-400" size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." className="w-full rounded-2xl border border-slate-200 bg-white px-10 py-3.5 outline-none"/></div><select value={category} onChange={e=>setCategory(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm"><option value="">All categories</option>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">{categories.map(c=><button key={c} onClick={()=>setCategory(category===c?'':c)} className={'whitespace-nowrap rounded-full border px-3 py-1.5 text-xs '+(category===c?'border-slate-950 bg-slate-950 text-white':'border-slate-200 bg-white text-slate-600')}>{c}</button>)}</div>
      {loading ? <div className="py-16 text-center text-slate-500">Loading marketplace...</div> : products.length===0 ? <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center"><Store className="mx-auto text-slate-400"/><h2 className="mt-4 font-semibold">No products listed yet</h2><p className="mt-2 text-sm text-slate-500">Approved partners can add real products with their own images and links.</p></div> :
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map(p=><Link key={p.id} href={'/marketplace/'+p.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"><div className="aspect-square bg-slate-100">{p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover"/> : <div className="grid h-full place-items-center text-slate-400"><ShoppingBag size={32}/></div>}</div><div className="p-4"><div className="text-xs text-slate-400">{p.category}</div><h2 className="mt-1 font-semibold">{p.name}</h2><div className="mt-2 font-semibold">{p.priceRwf==null?'Price on request':p.priceRwf.toLocaleString()+' RWF'}</div><div className="mt-2 text-xs text-slate-500">{p.partner.businessName} · {p.partner.location}</div>{p.sourceShop&&<div className="mt-2 text-xs font-medium text-emerald-700">Source: {p.sourceShop}</div>}{p.verifiedAt&&<div className="mt-1 text-[11px] text-slate-400">Verified: {new Date(p.verifiedAt).toLocaleDateString()}</div>}<div className="mt-4 flex items-center justify-between gap-2"><span className="text-xs font-semibold text-violet-600">View product <ArrowRight size={13}/></span>{p.productUrl&&<a href={p.productUrl} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} className="text-xs font-semibold text-slate-600">Original shop</a>}</div></div></Link>)}</div>}
    </div>
  </main>;
}
