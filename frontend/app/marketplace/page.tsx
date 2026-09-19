'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Search, ShoppingBag, Store, ArrowRight, ChevronDown, Heart, SlidersHorizontal } from 'lucide-react';
import { api } from '../../lib/api';

type Product = { id:string; name:string; category:string; description:string|null; priceRwf:number|null; imageUrl:string|null; productUrl:string|null; sourceShop:string|null; sourceUrl:string|null; verifiedAt:string|null; priceStatus:string|null; stock:number; partner:{businessName:string; location:string} };

const categories = ['Clothing','Furniture','T-shirts','Laptops','Desktops','Mobile Phones','Flat Screens','Screen protectors','Mobile covers','Keypad phones','Solar panels','Car wheels','Motor wheels','Football','Bulbs','Multi-sockets','Caps','Tables','Chairs','Bags','Jumpers','Websites','Mobile apps','Masonry equipment','Medicine','Body oil','Toys'];

const categoryIcons: Record<string,string> = {
  'Mobile Phones':'📱','Laptops':'💻','Desktops':'🖥️','Flat Screens':'📺','T-shirts':'👕','Clothing':'👗',
  'Furniture':'🛋️','Bags':'👜','Toys':'🧸','Football':'⚽','Solar panels':'☀️','Car wheels':'🛞'
};

export default function MarketplacePage() {
  const [products,setProducts]=useState<Product[]>([]);
  const [search,setSearch]=useState('');
  const [category,setCategory]=useState('');
  const [loading,setLoading]=useState(true);
  const [sort,setSort]=useState('featured');

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

  const sorted=[...products].sort((a,b)=>{
    if(sort==='priceLow') return (a.priceRwf??Infinity)-(b.priceRwf??Infinity);
    if(sort==='priceHigh') return (b.priceRwf??-1)-(a.priceRwf??-1);
    return 0;
  });

  return <main className="min-h-screen bg-white text-slate-900">
    <div className="bg-[#111827] text-white">
      <div className="mx-auto max-w-7xl px-4 py-2 text-xs flex items-center justify-between">
        <span>Free shipping on selected orders • Secure purchasing through LUMIA</span>
        <span className="hidden sm:block">Rwanda · RWF</span>
      </div>
    </div>

    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex h-16 items-center gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#ff6a00] text-white font-black">L</span>
            <span className="text-xl font-black tracking-tight">LUMIA<span className="text-[#ff6a00]">.</span></span>
          </Link>
          <div className="hidden lg:block w-px h-7 bg-slate-200" />
          <div className="hidden lg:block text-sm font-semibold text-slate-700">Marketplace</div>

          <div className="ml-auto hidden md:flex items-center gap-3 text-sm">
            <Link href="/services" className="text-slate-600 hover:text-slate-950">Services</Link>
            <Link href="/partner/register" className="text-slate-600 hover:text-slate-950">Become a partner</Link>
            <Link href="/dashboard" className="rounded-lg bg-slate-950 px-4 py-2 font-semibold text-white">Dashboard</Link>
          </div>
          <button className="ml-auto md:hidden rounded-lg border p-2"><SlidersHorizontal size={18}/></button>
        </div>

        <div className="pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={19}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products, categories and suppliers..." className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3.5 pl-12 pr-4 outline-none focus:border-[#ff6a00] focus:bg-white"/>
          </div>
        </div>
      </div>
    </header>

    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-5 lg:px-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Shop by category</h2>
          <button className="text-sm font-semibold text-[#ff6a00]">View all</button>
        </div>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-1">
          {categories.slice(0,12).map(c=><button key={c} onClick={()=>setCategory(category===c?'':c)} className={'min-w-[92px] rounded-2xl border p-3 text-center transition '+(category===c?'border-[#ff6a00] bg-orange-50':'border-slate-200 bg-white hover:border-slate-300')}>
            <div className="text-2xl">{categoryIcons[c]||'◻️'}</div>
            <div className="mt-2 text-xs font-semibold leading-tight">{c}</div>
          </button>)}
        </div>
      </div>
    </section>

    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <div className="rounded-2xl bg-[#ff6a00] p-6 text-white min-h-[220px] flex flex-col justify-between overflow-hidden">
            <div><div className="text-xs font-bold uppercase tracking-[.16em]">LUMIA Marketplace</div><h1 className="mt-2 max-w-md text-3xl font-black leading-tight">Discover products from trusted sellers.</h1><p className="mt-2 max-w-md text-sm text-orange-50">Real products, Rwanda prices, clear seller information and direct ordering.</p></div>
            <Link href="/partner/register" className="mt-5 inline-flex w-fit items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950">Sell on LUMIA <ArrowRight size={15}/></Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[['Electronics','📱','Mobile Phones'],['Computers','💻','Laptops'],['Home','🛋️','Furniture'],['Fashion','👕','Clothing']].map(([t,icon,c])=><button key={t} onClick={()=>setCategory(c)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left hover:shadow-sm"><div className="text-3xl">{icon}</div><div className="mt-3 font-bold">{t}</div><div className="mt-1 text-xs text-slate-500">Explore products</div></button>)}
          </div>
        </div>
      </div>
    </section>

    <main className="mx-auto max-w-7xl px-4 py-7 lg:px-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="text-sm font-semibold text-[#ff6a00]">Products</div><h2 className="mt-1 text-2xl font-black">{category||'All products'}</h2></div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><SlidersHorizontal size={15}/> Filters</button>
          <div className="relative"><select value={sort} onChange={e=>setSort(e.target.value)} className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm"><option value="featured">Featured</option><option value="priceLow">Price: low to high</option><option value="priceHigh">Price: high to low</option></select><ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-3"/></div>
        </div>
      </div>

      {loading ? <div className="py-20 text-center text-slate-500">Loading products...</div> : sorted.length===0 ? <div className="py-20 text-center"><Store className="mx-auto text-slate-400"/><h3 className="mt-4 font-bold">No products found</h3><p className="mt-2 text-sm text-slate-500">Try another search or category.</p></div> :
      <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{
        sorted.map(p=><Link key={p.id} href={'/marketplace/'+p.id} className="group min-w-0">
          <div className="relative overflow-hidden rounded-xl bg-slate-100 aspect-square border border-slate-200">
            {p.imageUrl?<img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105"/>:<div className="grid h-full place-items-center text-slate-400"><ShoppingBag size={32}/></div>}
            <button type="button" onClick={e=>e.preventDefault()} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-slate-700 shadow-sm"><Heart size={15}/></button>
          </div>
          <div className="pt-3">
            <div className="line-clamp-2 min-h-[40px] text-sm font-semibold leading-5">{p.name}</div>
            <div className="mt-2 text-lg font-black">{p.priceRwf==null?'Price on request':p.priceRwf.toLocaleString()+' RWF'}</div>
            <div className="mt-1 text-xs text-slate-500">{p.partner.businessName} · {p.partner.location}</div>
            {p.priceStatus&&<div className="mt-2 text-[11px] font-semibold text-emerald-700">{p.priceStatus==='RW_VERIFIED'?'Rwanda price verified':'Rwanda market reference'}</div>}
            <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#ff6a00]">View product <ArrowRight size={13}/></div>
          </div>
        </Link>)
      }</div>}
    </main>

    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div><div className="text-lg font-black">LUMIA.</div><p className="mt-2 text-sm text-slate-500">A Rwanda-focused marketplace for products and digital services.</p></div>
          <div><h3 className="font-bold">Marketplace</h3><div className="mt-3 space-y-2 text-sm text-slate-500"><Link href="/marketplace">All products</Link><Link href="/partner/register">Sell with LUMIA</Link></div></div>
          <div><h3 className="font-bold">Help</h3><div className="mt-3 space-y-2 text-sm text-slate-500"><Link href="/services">Services</Link><Link href="/dashboard">My account</Link></div></div>
          <div><h3 className="font-bold">Buying</h3><p className="mt-3 text-sm text-slate-500">Prices are displayed in RWF. Seller and source details are shown on each product.</p></div>
        </div>
      </div>
    </footer>
  </main>;
}
