'use client';

import Link from 'next/link';
import { ArrowLeft, Bot, Plus, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState<string[]>([]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = message.trim();
    if (!value) return;
    setSent((items) => [...items, value]);
    setMessage('');
  }

  return <main className="min-h-screen bg-slate-50 text-slate-950"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft size={15}/> Dashboard</Link><div className="flex items-center gap-2 text-sm font-semibold"><div className="grid h-8 w-8 place-items-center rounded-xl bg-slate-950 text-white"><Sparkles size={15}/></div>LUMIA</div><button className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white"><Plus size={17}/></button></div></header><div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-5xl flex-col px-4 sm:px-5"><div className="flex-1 py-8">{sent.length === 0 ? <div className="mx-auto max-w-2xl pt-16 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-white"><Bot size={23}/></div><h1 className="mt-6 text-4xl font-semibold tracking-tight">How can I help?</h1><p className="mt-3 text-slate-500">Ask LUMIA about learning, coding, websites, opportunities, research, or Irembo services.</p><div className="mt-8 grid gap-3 text-left sm:grid-cols-2">{['Help me plan a website','Explain something I want to learn','Find an Irembo service','Help me prepare a job application'].map((item)=><button key={item} onClick={()=>setMessage(item)} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 hover:border-slate-400">{item}</button>)}</div></div> : <div className="mx-auto max-w-2xl space-y-5">{sent.map((text,i)=><div key={`${text}-${i}`} className="flex justify-end"><div className="max-w-[85%] rounded-3xl rounded-br-lg bg-slate-950 px-5 py-3.5 text-sm leading-6 text-white">{text}</div></div>)}<div className="flex items-start gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white border border-slate-200"><Bot size={16}/></div><div className="rounded-3xl rounded-bl-lg border border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-600">Your message is ready for the LUMIA API. Connect the frontend API endpoint to enable live AI responses.</div></div></div>}</div><form onSubmit={submit} className="sticky bottom-0 mx-auto w-full max-w-2xl pb-5"><div className="flex items-end gap-2 rounded-3xl border border-slate-200 bg-white p-2 shadow-lg"><textarea value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Message LUMIA..." rows={1} className="max-h-32 min-h-12 flex-1 resize-none bg-transparent px-4 py-3 text-sm outline-none"/><button aria-label="Send" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-950 text-white disabled:opacity-40" disabled={!message.trim()}><Send size={17}/></button></div><div className="mt-2 text-center text-[11px] text-slate-400">LUMIA can make mistakes. Verify important information with official sources.</div></form></div></main>;
}
