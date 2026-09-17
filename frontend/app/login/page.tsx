import Link from 'next/link';
import { ArrowLeft, LockKeyhole, Mail } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft size={15} /> Back home</Link>
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white">L</div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to continue to your LUMIA workspace.</p>
          <form className="mt-8 space-y-4">
            <label className="block"><span className="mb-2 block text-sm font-medium">Email</span><div className="relative"><Mail className="absolute left-3 top-3.5 text-slate-400" size={16}/><input type="email" placeholder="you@example.com" className="w-full rounded-2xl border border-slate-200 bg-white px-10 py-3.5 text-sm outline-none ring-0 focus:border-slate-400"/></div></label>
            <label className="block"><span className="mb-2 block text-sm font-medium">Password</span><div className="relative"><LockKeyhole className="absolute left-3 top-3.5 text-slate-400" size={16}/><input type="password" placeholder="••••••••" className="w-full rounded-2xl border border-slate-200 bg-white px-10 py-3.5 text-sm outline-none focus:border-slate-400"/></div></label>
            <button type="submit" className="w-full rounded-2xl bg-slate-950 py-3.5 text-sm font-semibold text-white">Sign in</button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">New to LUMIA? <Link href="/register" className="font-semibold text-slate-950">Create an account</Link></p>
        </div>
      </div>
    </main>
  );
}
