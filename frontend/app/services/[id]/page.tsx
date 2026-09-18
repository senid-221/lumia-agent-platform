import Link from 'next/link';
import { ArrowLeft, Bot, CheckCircle2, ChevronRight, FileText, Landmark, MapPin, Phone, WalletCards } from 'lucide-react';

export default async function ServiceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const label = decodeURIComponent(id).replace(/-/g, ' ');
  const title = label.replace(/\b\w/g, (m) => m.toUpperCase());
  const chatHref = "/chat?service=" + encodeURIComponent(title);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/services" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft size={15}/> Serivisi zose</Link>
          <Link href={chatHref} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Ask LUMIA</Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-10">
        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-700 shadow-sm"><Bot size={13}/> LUMIA service assistant</div>
          <div className="mt-5 grid h-11 w-11 place-items-center rounded-full bg-white text-sky-600 shadow"><Landmark size={20}/></div>
          <div className="mt-5 text-xs font-semibold uppercase tracking-[.15em] text-sky-600">IREMBO SERVICE</div>
          <h1 className="mt-2 text-3xl font-semibold capitalize tracking-tight">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">LUMIA izagufasha gusobanukirwa ibisabwa, amafaranga, igihe serivisi ishobora gufata, hanyuma ikwereke Available Agents bakwegereye kugira ngo bagufashe gusaba iyi serivisi.</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 text-xs text-slate-400"><FileText size={14}/> Ibisabwa</div><div className="mt-2 font-semibold">LUMIA izabigenzura</div><p className="mt-2 text-xs leading-5 text-slate-500">Tuzabanza kugenzura requirements z’iyi serivisi mbere yo gutangira.</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 text-xs text-slate-400"><WalletCards size={14}/> Igiciro</div><div className="mt-2 font-semibold">Verified fee</div><p className="mt-2 text-xs leading-5 text-slate-500">Amafaranga azagaragazwa nyuma yo kugenzura amakuru agezweho.</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 text-xs text-slate-400"><MapPin size={14}/> Available Agents</div><div className="mt-2 font-semibold">Find an agent</div><p className="mt-2 text-xs leading-5 text-slate-500">Hitamo agent ushaka ko agufasha kurangiza application.</p></div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 size={17} className="text-emerald-500"/> Uko LUMIA izagufasha</div>
            <div className="mt-5 space-y-3">
              {[
                'Sobanurirwa ibisabwa mbere yo gutangira.',
                'Menya igiciro n’amakuru ajyanye no kwishyura.',
                'Reba Available Agents kandi uhitemo uwo ushaka.',
                'Ohereza request yawe kuri agent wahisemo.',
              ].map((step, index) => (
                <div key={step} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">{index + 1}</div>
                  <div className="text-sm text-slate-600">{step}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6">
            <div className="text-xs font-semibold uppercase tracking-[.15em] text-violet-600">Next step</div>
            <h2 className="mt-2 text-xl font-semibold">Tangira kuri LUMIA AI</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">LUMIA izakwereka ibisabwa n’igiciro byagenzuwe, hanyuma ikwereke Available Agents.</p>
            <Link href={chatHref} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white">Komeza na LUMIA <ChevronRight size={15}/></Link>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/agents" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800"><Phone size={15}/> Available Agents</Link>
          <Link href={chatHref} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white"><Bot size={15}/> Gusaba Service na LUMIA</Link>
        </div>
      </div>
    </main>
  );
}
