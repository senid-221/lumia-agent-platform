'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../lib/api';
import { ArrowLeft, Heart, Minus, Plus, ShieldCheck, Truck, ShoppingCart, ExternalLink, Star } from 'lucide-react';

type Product={id:string;name:string;category:string;description:string|null;priceRwf:number|null;imageUrl:string|null;productUrl:string|null;sourceShop:string|null;sourceUrl:string|null;verifiedAt:string|null;priceStatus:string|null;stock:number;partner:{businessName:string;phone:string;location:string;description:string|null}};

export default function ProductPage(){
 const params=useParams<{id:string}>();
 const [p,setP]=useState<Product|null>(null);
 const [qty,setQty]=useState(1);
 const [name,setName]=useState('');
 const [phone,setPhone]=useState('');
 const [location,setLocation]=useState('');
 const [notes,setNotes]=useState('');
 const [message,setMessage]=useState('');
 const [loading,setLoading]=useState(true);
 const [wish,setWish]=useState(false);

 useEffect(()=>{void api<{product:Product}>('/api/v1/marketplace/products/'+params.id).then(d=>setP(d.product)).catch(e=>setMessage(e instanceof Error?e.message:'Product not found')).finally(()=>setLoading(false));},[params.id]);

 async function order(e:React.FormEvent){
   e.preventDefault(); setMessage('');
   const token=localStorage.getItem('lumia_token');
   if(!token){setMessage('Banza winjire muri LUMIA kugirango ukore order.');return;}
   try{
     const r=await api<{orderId:string}>('/api/v1/marketplace/orders',{
       method:'POST',
       headers:{Authorization:'Bearer '+token},
       body:JSON.stringify({productId:p?.id,quantity:qty,customerName:name,customerPhone:phone,deliveryLocation:location,notes:notes||undefined})
     });
     setMessage('Order yakiriwe. Order ID: '+r.orderId);
   }catch(e){setMessage(e instanceof Error?e.message:'Order failed.');}
 }
 if(loading)return <main className="min-h-screen grid place-items-center bg-white text-slate-500">Loading product...</main>;
 if(!p)return <main className="min-h-screen p-8"><Link href="/marketplace" className="text-sm text-slate-500">← Marketplace</Link><p className="mt-8">{message}</p></main>;

 const total=(p.priceRwf??0)*qty;
 const canOrder=p.priceStatus!=='RW_REFERENCE' && p.stock>0;

 return <main className="min-h-screen bg-white text-slate-950">
   <div className="border-b border-slate-200 bg-white">
     <div className="mx-auto max-w-7xl px-4 py-3 text-xs text-slate-500 lg:px-6">LUMIA Marketplace · Rwanda · RWF</div>
   </div>

   <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
     <Link href="/marketplace" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft size={15}/> Back to marketplace</Link>

     <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_.95fr]">
       <section>
         <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 aspect-square">
           {p.imageUrl?<img src={p.imageUrl} alt={p.name} className="h-full w-full object-contain p-4"/>:<div className="grid h-full place-items-center text-slate-400">No product image</div>}
           <button type="button" onClick={()=>setWish(!wish)} className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm border border-slate-200">
             <Heart size={19} className={wish?'fill-current text-rose-500':'text-slate-700'}/>
           </button>
         </div>
         <div className="mt-4 grid grid-cols-4 gap-3">
           {[p.imageUrl].filter(Boolean).map((src,i)=><div key={i} className="aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50"><img src={src!} alt="" className="h-full w-full object-contain p-2"/></div>)}
           {[1,2,3].map(i=><div key={'empty'+i} className="aspect-square rounded-xl border border-dashed border-slate-200 bg-slate-50"/>).slice(0,Math.max(0,3-(p.imageUrl?1:0)))}
         </div>
       </section>

       <section>
         <div className="text-xs font-bold uppercase tracking-[.14em] text-[#ff6a00]">{p.category}</div>
         <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{p.name}</h1>
         <div className="mt-4 flex items-center gap-2 text-sm text-slate-500"><Star size={15} className="fill-amber-400 text-amber-400"/> Product listing · {p.partner.businessName}</div>

         <div className="mt-6 border-y border-slate-200 py-5">
           <div className="text-3xl font-black">{p.priceRwf==null?'Price on request':p.priceRwf.toLocaleString()+' RWF'}</div>
           {p.priceStatus&&<div className="mt-2 text-xs font-semibold text-emerald-700">{p.priceStatus==='RW_VERIFIED'?'Rwanda price verified':'Rwanda market reference'}</div>}
           {p.verifiedAt&&<div className="mt-1 text-xs text-slate-400">Price checked: {new Date(p.verifiedAt).toLocaleDateString()}</div>}
         </div>

         <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-600">{p.description||'Product details are provided by the seller/source.'}</p>

         <div className="mt-6 grid gap-3 sm:grid-cols-3">
           <div className="rounded-xl bg-slate-50 p-4"><ShieldCheck size={18}/><div className="mt-2 text-xs font-bold">Seller details</div><div className="mt-1 text-xs text-slate-500">{p.partner.location}</div></div>
           <div className="rounded-xl bg-slate-50 p-4"><Truck size={18}/><div className="mt-2 text-xs font-bold">Delivery</div><div className="mt-1 text-xs text-slate-500">Discuss at checkout</div></div>
           <div className="rounded-xl bg-slate-50 p-4"><ShoppingCart size={18}/><div className="mt-2 text-xs font-bold">Ordering</div><div className="mt-1 text-xs text-slate-500">LUMIA order tracking</div></div>
         </div>

         {p.sourceShop&&<div className="mt-6 rounded-2xl border border-slate-200 p-4">
           <div className="text-xs uppercase tracking-wide text-slate-400">Source</div>
           <div className="mt-1 font-bold">{p.sourceShop}</div>
           {p.sourceUrl&&<a href={p.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-[#ff6a00]">View source <ExternalLink size={14}/></a>}
         </div>}

         {canOrder ? <form onSubmit={order} className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
           <div className="flex items-center justify-between"><h2 className="font-bold">Buy this product</h2><div className="text-sm text-slate-500">Stock: {p.stock}</div></div>
           <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 p-2">
             <span className="px-2 text-sm font-semibold">Quantity</span>
             <div className="flex items-center gap-2"><button type="button" onClick={()=>setQty(Math.max(1,qty-1))} className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100"><Minus size={15}/></button><span className="w-7 text-center font-bold">{qty}</span><button type="button" onClick={()=>setQty(Math.min(p.stock,qty+1))} className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100"><Plus size={15}/></button></div>
           </div>
           <div className="mt-4 grid gap-3">
             <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#ff6a00]"/>
             <input required value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+250..." className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#ff6a00]"/>
             <input required value={location} onChange={e=>setLocation(e.target.value)} placeholder="Delivery location" className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#ff6a00]"/>
             <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes (optional)" className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#ff6a00]"/>
           </div>
           <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4"><span className="text-sm text-slate-500">Total</span><span className="text-xl font-black">{total.toLocaleString()} RWF</span></div>
           <button className="mt-4 w-full rounded-xl bg-[#ff6a00] p-3.5 font-bold text-white hover:brightness-95">Gura ubu</button>
           {message&&<div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">{message}</div>}
         </form> : <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
           <div className="font-bold">Gura ubu</div>
           <p className="mt-1 text-sm text-slate-500">Iyi product ifite source mpuzamahanga. LUMIA izakira order yawe kandi ikoreshe product/source link ibitswe kuri listing.</p>
           <a href={p.productUrl||p.sourceUrl||'#'} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#ff6a00] px-5 py-3 font-bold text-white">Gura ubu <ExternalLink size={15}/></a>
         </div>}
       </section>
     </div>

     <section className="mt-12 border-t border-slate-200 pt-8">
       <h2 className="text-2xl font-black">Product information</h2>
       <div className="mt-4 grid gap-3 md:grid-cols-3">
         <div className="rounded-xl border border-slate-200 p-4"><div className="text-xs text-slate-400">Seller</div><div className="mt-1 font-semibold">{p.partner.businessName}</div></div>
         <div className="rounded-xl border border-slate-200 p-4"><div className="text-xs text-slate-400">Location</div><div className="mt-1 font-semibold">{p.partner.location}</div></div>
         <div className="rounded-xl border border-slate-200 p-4"><div className="text-xs text-slate-400">Phone</div><div className="mt-1 font-semibold">{p.partner.phone}</div></div>
       </div>
     </section>
   </div>
 </main>;
}
