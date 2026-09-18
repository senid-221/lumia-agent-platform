'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bot, Bell, BriefcaseBusiness, CheckCircle2, ChevronRight, FileText, Landmark, MessageSquare, Search, UserRound } from 'lucide-react';
import { api } from '../../lib/api';

type Notification = { id: string; title: string; body: string; readAt: string | null; createdAt: string; type: string };

const actions = [
  { href: '/chat', icon: MessageSquare, title: 'Talk to LUMIA', text: 'Ask a question, plan a task, or start building.' },
  { href: '/services', icon: Landmark, title: 'Explore Irembo', text: 'Find services, requirements and help from agents.' },
  { href: '/agents', icon: UserRound, title: 'Find an agent', text: 'Browse available verified Irembo agents.' },
  { href: '/requests', icon: FileText, title: 'My requests', text: 'Track your submitted service requests.' },
];

export default function DashboardPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  async function loadNotifications() {
    const token = window.localStorage.getItem('lumia_token');
    if (!token) return;
    try {
      const data = await api<{ notifications: Notification[] }>('/api/v1/notifications', {
        headers: { Authorization: 'Bearer ' + token },
      });
      setNotifications(data.notifications);
    } finally {
      setLoadingNotifications(false);
    }
  }

  useEffect(() => { void loadNotifications(); }, []);

  async function markRead(id: string) {
    const token = window.localStorage.getItem('lumia_token');
    if (!token) return;
    await api('/api/v1/notifications/' + id + '/read', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
    });
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, readAt: new Date().toISOString() } : item));
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="text-sm font-semibold tracking-[0.18em]">LUMIA</Link>
          <div className="flex items-center gap-3">
            <Link href="/chat" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Open LUMIA</Link>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-200"><UserRound size={16}/></div>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div><div className="text-sm font-medium text-slate-500">CUSTOMER WORKSPACE</div><h1 className="mt-2 text-2xl font-semibold tracking-tight">Good to see you.</h1><p className="mt-2 text-slate-600">Choose what you want to get done today.</p></div>
          <div className="relative w-full max-w-sm"><Search className="absolute left-3 top-3.5 text-slate-400" size={17}/><input placeholder="Search services or tasks" className="w-full rounded-2xl border border-slate-200 bg-white px-10 py-3.5 text-sm outline-none focus:border-slate-400"/></div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">{actions.map(({href,icon:Icon,title,text})=><Link key={href} href={href} className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg"><div className="flex items-start justify-between"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100"><Icon size={19}/></div><ChevronRight className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-700" size={18}/></div><h2 className="mt-4 font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></Link>)}</div>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between"><div><div className="flex items-center gap-2 text-sm font-semibold"><Bell size={16}/> Notifications</div><p className="mt-1 text-xs text-slate-500">Service requests and agent updates.</p></div><div className="text-xs text-slate-400">{notifications.filter((n) => !n.readAt).length} unread</div></div>
          <div className="mt-5 space-y-3">
            {loadingNotifications && <div className="text-sm text-slate-400">Loading notifications…</div>}
            {!loadingNotifications && notifications.length === 0 && <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">No notifications yet.</div>}
            {notifications.map((notification) => (
              <button key={notification.id} onClick={() => void markRead(notification.id)} className={'w-full rounded-2xl border p-4 text-left ' + (notification.readAt ? 'border-slate-100 bg-white' : 'border-violet-100 bg-violet-50/50')}>
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white border border-slate-100"><CheckCircle2 size={16} className="text-violet-600"/></div>
                  <div className="min-w-0"><div className="text-sm font-semibold">{notification.title}</div><div className="mt-1 text-sm leading-6 text-slate-600">{notification.body}</div><div className="mt-2 text-[11px] text-slate-400">{new Date(notification.createdAt).toLocaleString()}</div></div>
                </div>
              </button>
            ))}
          </div>
        </section>


        <Link href="/provider/register" className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"><BriefcaseBusiness size={16}/> Become a Service Provider</Link>
        <Link href="/agent/requests" className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700"><UserRound size={16}/> Agent Workspace</Link>
        <section className="mt-5 rounded-2xl bg-slate-950 p-5 text-white">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="max-w-2xl"><div className="flex items-center gap-2 text-sm font-medium text-slate-300"><Bot size={16}/> LUMIA assistant</div><h2 className="mt-3 text-2xl font-semibold">What are you working on?</h2><p className="mt-2 text-sm leading-6 text-slate-400">Start a conversation and let LUMIA help you break the task into practical next steps.</p></div><Link href="/chat" className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">Start a conversation</Link></div>
        </section>
      </div>
    </main>
  );
}
