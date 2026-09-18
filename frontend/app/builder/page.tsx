'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bot, Check, Code2, Copy, Download, ExternalLink, FileCode2, Globe2, Loader2, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';

type BuilderFile = { path: string; content: string; language: string };
type BuilderResult = { name: string; summary: string; framework: string; style: string; files: BuilderFile[]; run: string; notes: string[]; sources: Array<{ title: string; url: string }> };

export default function BuilderPage() {
  const [prompt, setPrompt] = useState('');
  const [framework, setFramework] = useState<'nextjs'|'react'|'html'>('nextjs');
  const [style, setStyle] = useState<'modern'|'minimal'|'premium'|'bold'>('modern');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BuilderResult | null>(null);
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');

  const selectedFile = useMemo(() => result?.files.find((file) => file.path === selected) ?? result?.files[0], [result, selected]);

  async function build() {
    if (prompt.trim().length < 10 || loading) return;
    setLoading(true); setError('');
    try {
      const token = window.localStorage.getItem('lumia_token');
      if (!token) throw new Error('Please log in first.');
      const data = await api<BuilderResult>('/api/v1/builder/generate', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: JSON.stringify({ prompt, framework, style })
      });
      setResult(data); setSelected(data.files[0]?.path || '');
    } catch (err) { setError(err instanceof Error ? err.message : 'Builder failed.'); }
    finally { setLoading(false); }
  }

  function copyFile() { if (selectedFile) void navigator.clipboard.writeText(selectedFile.content); }

  function downloadProject() {
    if (!result) return;
    const blob = new Blob([JSON.stringify({ name: result.name, files: result.files }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = result.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-project.json'; anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#0b0b0e] text-slate-100">
      <header className="border-b border-white/10 bg-[#0d0d11]/90 px-4 py-3 backdrop-blur sm:px-7">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/chat" className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[.03] text-slate-400 hover:text-white"><ArrowLeft size={16}/></Link>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/15 text-violet-300"><Sparkles size={17}/></div>
            <div><div className="text-sm font-semibold">LUMIA BUILDER</div><div className="text-[10px] uppercase tracking-[.18em] text-slate-500">AI website workspace</div></div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500"><Globe2 size={14}/> Research + Build</div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 lg:grid-cols-[390px_1fr]">
        <section className="rounded-3xl border border-white/10 bg-[#111116] p-5">
          <div className="flex items-center gap-2 text-sm font-semibold"><Bot size={16} className="text-violet-300"/> Describe your website</div>
          <p className="mt-2 text-xs leading-5 text-slate-500">LUMIA turns your request into a runnable project. Requests that need current documentation or research can use web context before code generation.</p>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Example: Build a restaurant website with Home, Menu, About, Contact, a WhatsApp order button, responsive mobile design and a premium black-and-gold look." className="mt-4 min-h-44 w-full resize-none rounded-2xl border border-white/10 bg-[#0c0c10] p-4 text-sm leading-6 text-slate-200 outline-none placeholder:text-slate-600 focus:border-violet-400/50"/>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <label className="rounded-xl border border-white/10 bg-white/[.02] p-3"><span className="text-[10px] uppercase tracking-[.15em] text-slate-600">Framework</span><select value={framework} onChange={(e) => setFramework(e.target.value as typeof framework)} className="mt-2 w-full bg-transparent text-sm text-slate-200 outline-none"><option value="nextjs">Next.js</option><option value="react">React</option><option value="html">HTML/CSS/JS</option></select></label>
            <label className="rounded-xl border border-white/10 bg-white/[.02] p-3"><span className="text-[10px] uppercase tracking-[.15em] text-slate-600">Style</span><select value={style} onChange={(e) => setStyle(e.target.value as typeof style)} className="mt-2 w-full bg-transparent text-sm text-slate-200 outline-none"><option value="modern">Modern</option><option value="premium">Premium</option><option value="minimal">Minimal</option><option value="bold">Bold</option></select></label>
          </div>
          <button onClick={() => void build()} disabled={loading || prompt.trim().length < 10} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 disabled:cursor-not-allowed disabled:opacity-40">{loading ? <><Loader2 size={16} className="animate-spin"/> Building website…</> : <><Sparkles size={16}/> Build website</>}</button>
          <div className="mt-4 rounded-2xl border border-white/5 bg-white/[.02] p-3 text-xs leading-5 text-slate-500"><div className="flex items-center gap-2 text-slate-300"><Check size={14}/> Real project files</div><div className="mt-1">Research is used as context; it is not presented as a fake build or fake deployment.</div></div>
          {error && <div className="mt-4 rounded-xl border border-red-400/20 bg-red-500/5 p-3 text-xs text-red-300">{error}</div>}
        </section>

        <section className="min-h-[650px] rounded-3xl border border-white/10 bg-[#111116] overflow-hidden">
          {!result ? <div className="grid min-h-[650px] place-items-center px-8 text-center"><div><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[.03] text-violet-300"><Code2 size={22}/></div><h1 className="mt-4 text-xl font-semibold">Your generated project appears here</h1><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Describe what you want, then LUMIA will generate the project structure and source files.</p></div></div> : (
            <div className="flex h-full min-h-[650px] flex-col">
              <div className="border-b border-white/10 p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-lg font-semibold">{result.name}</div><div className="mt-1 text-xs leading-5 text-slate-500">{result.summary}</div></div><button onClick={downloadProject} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.03] px-3 py-2 text-xs text-slate-300 hover:bg-white/[.06]"><Download size={14}/> Export project</button></div></div>
              <div className="grid min-h-0 flex-1 md:grid-cols-[220px_1fr]">
                <div className="border-b border-white/10 bg-[#0d0d11] p-2 md:border-b-0 md:border-r">{result.files.map((file) => <button key={file.path} onClick={() => setSelected(file.path)} className={'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs ' + (selectedFile?.path === file.path ? 'bg-violet-500/10 text-violet-200' : 'text-slate-500 hover:bg-white/[.03] hover:text-slate-300')}><FileCode2 size={13}/><span className="truncate">{file.path}</span></button>)}</div>
                <div className="min-w-0"><div className="flex items-center justify-between border-b border-white/10 px-4 py-2"><div className="text-xs text-slate-500">{selectedFile?.path}</div><button onClick={copyFile} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-white/[.05]"><Copy size={13}/> Copy</button></div><pre className="max-h-[560px] overflow-auto p-4 text-xs leading-5 text-slate-300"><code>{selectedFile?.content || ''}</code></pre></div>
              </div>
              <div className="border-t border-white/10 bg-[#0d0d11] px-4 py-3 text-xs text-slate-500"><div className="flex items-center gap-2 text-slate-300"><ExternalLink size={13}/> Run</div><div className="mt-1">{result.run}</div>{result.sources.length > 0 && <div className="mt-2">Research sources: {result.sources.map((s) => s.title).join(' · ')}</div>}</div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
