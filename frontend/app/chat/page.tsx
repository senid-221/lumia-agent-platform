'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { ArrowUp, Bot, Check, ChevronDown, FileText, Globe2, Image as ImageIcon, MapPin, Menu, MessageCircle, Music2, Paperclip, Plus, Search, Users, X, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { useSearchParams } from 'next/navigation';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

function ChatPageContent() {
  const searchParams = useSearchParams();
  const service = searchParams.get('service') || '';
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(() =>
    typeof window !== 'undefined' ? window.localStorage.getItem('lumia_chat_session') ?? undefined : undefined
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [serviceAgents, setServiceAgents] = useState<Array<{ id: string; displayName: string; phone: string; location: string; serviceAreas: string[] }>>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');

  async function sendMessage(text?: string) {
    const value = (text ?? message).trim();
    if (!value || loading) return;
    setMessage('');
    setError('');
    setMessages((items) => [...items, { role: 'user', content: value }]);
    setLoading(true);

    try {
      const token = window.localStorage.getItem('lumia_token');
      if (!token) throw new Error('Please log in first.');
      const result = await api<{ sessionId: string; message: string }>('/api/v1/chat', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: value, sessionId }),
      });
      setSessionId(result.sessionId);
      window.localStorage.setItem('lumia_chat_session', result.sessionId);
      setMessages((items) => [...items, { role: 'assistant', content: result.message }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach LUMIA.');
    } finally {
      setLoading(false);
    }
  }

  async function loadAgents(serviceName: string) {
    setAgentsLoading(true);
    setError('');
    try {
      const result = await api<{ agents: Array<{ id: string; displayName: string; phone: string; location: string; serviceAreas: string[] }> }>(
        '/api/v1/irembo-agents?serviceType=' + encodeURIComponent(serviceName)
      );
      setServiceAgents(result.agents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load available agents.');
    } finally {
      setAgentsLoading(false);
    }
  }

  async function chooseAgent(agentId: string) {
    if (!selectedService) return;
    try {
      const token = window.localStorage.getItem('lumia_token');
      if (!token) throw new Error('Please log in first.');
      const email = window.localStorage.getItem('lumia_email') || 'customer@lumia.local';
      const phone = window.localStorage.getItem('lumia_phone') || '';
      if (!/^\\+?[0-9]{8,15}$/.test(phone)) throw new Error('Please add a valid WhatsApp phone number to your account first.');
      const services = await api<{ services: Array<{ id: string; name: string }> }>('/api/v1/irembo/services');
      const service = services.services.find((item) => item.name.toLowerCase() === selectedService.toLowerCase());
      if (!service) throw new Error('This Irembo service is not yet linked to the service database.');
      const created = await api<{ requestId: string; status: string }>('/api/v1/irembo/service-requests', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          serviceId: service.id,
          customerName: email.split('@')[0],
          customerPhone: phone,
          description: 'Requested through LUMIA AI',
        }),
      });
      await api('/api/v1/irembo/service-requests/' + created.requestId + '/choose-agent', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ agentId }),
      });
      setRequestMessage('Request sent to the selected agent.');
    } catch (err) {
      setRequestMessage(err instanceof Error ? err.message : 'Could not create the request.');
    }
  }

  function newChat() {
    setSessionId(undefined);
    window.localStorage.removeItem('lumia_chat_session');
    setMessages([]);
    setError('');
    setSidebarOpen(false);
  }

  return (
    <main className="flex h-screen overflow-hidden bg-[#17171a] text-slate-100">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="fixed left-4 top-4 z-50 grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-[#202024] lg:hidden">
        {sidebarOpen ? <X size={16}/> : <Menu size={16}/>}
      </button>

      <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-white/5 bg-[#151518] p-4 transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 px-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/15 text-violet-300 text-sm font-semibold">L</div>
            <div><div className="text-sm font-semibold">LUMIA</div><div className="text-[10px] tracking-[.16em] text-slate-500">AI PLATFORM</div></div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button onClick={newChat} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-violet-400/60 bg-transparent px-3 py-2.5 text-sm text-slate-100 hover:bg-violet-500/10"><Plus size={15}/> New Chat</button>
            <button aria-label="Search" className="grid h-10 w-10 place-items-center rounded-xl border border-white/5 bg-white/[.02] text-slate-400"><Search size={15}/></button>
          </div>

          <nav className="mt-5 space-y-1 text-sm">
            <div className="flex items-center gap-3 rounded-xl bg-white/[.06] px-3 py-2.5 text-white"><MessageCircle size={15}/> Chat</div>
            <Link href="/services" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-500 hover:bg-white/[.04] hover:text-slate-200"><Globe2 size={15}/> Irembo</Link>
            <Link href="/agents" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-500 hover:bg-white/[.04] hover:text-slate-200"><Users size={15}/> Agents</Link>
            <Link href="/builder" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-500 hover:bg-white/[.04] hover:text-slate-200"><Sparkles size={15}/> Website Builder</Link>
          </nav>

          <div className="mt-6 border-t border-white/5 pt-4">
            <div className="px-2 text-[10px] font-semibold uppercase tracking-[.18em] text-slate-600">Pinned</div>
            <div className="mt-2 space-y-1 text-xs text-slate-500">
              {['Website strategy','Learn coding','Irembo services'].map((item) => <button key={item} className="w-full truncate rounded-lg px-3 py-2 text-left hover:bg-white/[.04] hover:text-slate-200">{item}</button>)}
            </div>
          </div>

          <div className="mt-5 border-t border-white/5 pt-4">
            <div className="px-2 text-[10px] font-semibold uppercase tracking-[.18em] text-slate-600">Today</div>
            <div className="mt-2 rounded-lg bg-white/[.04] px-3 py-2 text-xs text-slate-300">Current conversation</div>
          </div>

          <div className="mt-auto rounded-2xl border border-white/5 bg-[#202024] p-3">
            <div className="text-xs font-semibold text-slate-200">LUMIA Workspace</div>
            <div className="mt-1 text-[11px] leading-5 text-slate-500">Groq + Exa power your LUMIA workspace.</div>
            <Link href="/dashboard" className="mt-3 inline-flex text-xs text-violet-300">Dashboard →</Link>
          </div>
        </div>
      </aside>

      <section className="relative flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-end border-b border-white/5 px-5 py-3 lg:px-7">
          <div className="rounded-full border border-white/10 bg-white/[.03] px-3 py-1.5 text-xs text-slate-400">LUMIA AI</div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex min-h-full items-center justify-center px-4 py-8">
              <div className="w-full max-w-3xl text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/10 text-violet-300 text-base font-semibold">L</div>
                <div className="mt-5 text-sm text-slate-500">Welcome to LUMIA AI</div>
                <h1 className="mt-2 text-2xl font-medium tracking-[-0.03em] text-slate-100 sm:text-4xl">How Can I Assist You?</h1>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">Ask, research, build, learn, code, or get help with Irembo services.</p>

                {service && (
                  <div className="mx-auto mt-5 max-w-2xl rounded-xl border border-violet-400/30 bg-violet-500/5 p-4 text-left">
                    <div className="text-xs font-semibold uppercase tracking-[.15em] text-violet-300">Selected Irembo service</div>
                    <div className="mt-2 text-lg font-semibold text-slate-100">{service}</div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      {[
                        ['Ibisabwa', <FileText size={15}/>],
                        ['Igiciro', <Check size={15}/>],
                        ['Available agents', <MapPin size={15}/>],
                      ].map(([label, icon]) => <div key={String(label)} className="rounded-xl border border-white/10 bg-white/[.02] p-3 text-xs text-slate-400"><div className="flex items-center gap-2 text-slate-200">{icon}{label}</div><div className="mt-2">Baza LUMIA ibigenzure.</div></div>)}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
  <button onClick={() => { setSelectedService(service); void sendMessage(`Nshaka ${service}. Mbanza unsobanurire ibisabwa, igiciro n'igihe bifata.`); }} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white">Sobanukirwa service <ChevronDown size={15}/></button>
  <button onClick={() => { setSelectedService(service); void loadAgents(service); }} className="inline-flex items-center gap-2 rounded-xl border border-violet-400/30 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200"><Users size={15}/> Available Agents</button>
</div>
{selectedService === service && (
  <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-4">
    <div className="text-xs font-semibold uppercase tracking-[.15em] text-slate-500">Available Agents</div>
    {agentsLoading ? <div className="mt-3 text-sm text-slate-500">Searching agents…</div> : serviceAgents.length === 0 ? <div className="mt-3 text-sm text-slate-500">No verified agents are currently listed for this service.</div> : (
      <div className="mt-3 space-y-2">
        {serviceAgents.map((agent) => (
          <div key={agent.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[.02] p-3">
            <div><div className="text-sm font-semibold text-slate-200">{agent.displayName}</div><div className="mt-1 text-xs text-slate-500">{agent.location}</div></div>
            <button onClick={() => void chooseAgent(agent.id)} className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white">Request agent</button>
          </div>
        ))}
      </div>
    )}
    {requestMessage && <div className="mt-3 text-xs text-violet-300">{requestMessage}</div>}
  </div>
)}
                  </div>
                )}
                <div className="mt-6 grid gap-2 sm:grid-cols-3">
                  {['Build a website','Research a topic','Find an Irembo service'].map((item) => (
                    <button key={item} onClick={() => void sendMessage(item)} className="rounded-xl border border-white/10 bg-[#1d1d20] p-3 text-left text-sm text-slate-400 transition hover:border-violet-400/40 hover:bg-[#222225]">
                      <div className="mb-9 text-slate-600">{item === 'Research a topic' ? <Search size={16}/> : item === 'Find an Irembo service' ? <Globe2 size={16}/> : <Bot size={16}/>}</div>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-4xl space-y-4 px-3 py-5 sm:px-4">
              {messages.map((item, i) => (
                <div key={`${item.role}-${i}`} className={item.role === 'user' ? 'flex justify-end' : 'flex items-start gap-3'}>
                  {item.role === 'assistant' && <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-[#202024] text-violet-300"><Bot size={16}/></div>}
                  <div className={item.role === 'user' ? 'max-w-[88%] rounded-3xl rounded-br-lg bg-violet-500 px-4 py-3 text-sm leading-6 text-white whitespace-pre-wrap sm:max-w-[80%]' : 'w-full max-w-[calc(100%-2.5rem)] rounded-3xl rounded-bl-lg border border-white/10 bg-[#202024] px-4 py-3 text-sm leading-6 text-slate-200 whitespace-pre-wrap sm:max-w-[88%]'}>{item.content}</div>
                </div>
              ))}
              {loading && <div className="flex items-start gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-[#202024] text-violet-300"><Bot size={16}/></div><div className="rounded-3xl rounded-bl-lg border border-white/10 bg-[#202024] px-5 py-4 text-sm text-slate-500">LUMIA is responding…</div></div>}
              {error && <div className="text-sm text-red-400">{error}</div>}
            </div>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); void sendMessage(); }} className="border-t border-white/5 bg-gradient-to-t from-[#17171a] via-[#17171a]/95 to-transparent px-4 pb-5 pt-3 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-violet-400/70 bg-[#151518] p-2 shadow-[0_0_45px_rgba(168,85,247,.12)]">
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask LUMIA anything or write your request..." rows={1} disabled={loading} className="min-h-12 w-full resize-none bg-transparent px-4 py-3 text-sm text-slate-200 outline-none placeholder:text-slate-600"/>
              <div className="flex items-center justify-between px-2 pb-1">
                <div className="flex items-center gap-1 text-slate-500">
                  <button type="button" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/5"><MessageCircle size={14}/></button>
                  <button type="button" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/5"><ImageIcon size={14}/></button>
                  <button type="button" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/5"><Music2 size={14}/></button>
                  <button type="button" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/5"><Paperclip size={14}/></button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden items-center gap-1 text-xs text-slate-500 sm:flex">LUMIA AI <ChevronDown size={13}/></div>
                  <button aria-label="Send" type="submit" disabled={!message.trim() || loading} className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500 text-white shadow-lg shadow-violet-500/20 disabled:opacity-30"><ArrowUp size={16}/></button>
                </div>
              </div>
            </div>
            <div className="mt-2 text-center text-[11px] text-slate-600">LUMIA can make mistakes. Verify important information when needed.</div>
          </div>
        </form>
      </section>
    </main>
  );
}


export default function ChatPage() {
  return (
    <Suspense fallback={<main className="flex h-screen items-center justify-center bg-[#17171a] text-slate-300">Loading LUMIA…</main>}>
      <ChatPageContent />
    </Suspense>
  );
}
