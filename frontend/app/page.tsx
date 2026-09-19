'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router=useRouter();
  useEffect(()=>{router.replace('/chat');},[router]);
  return <main className="min-h-screen bg-[#17171a] text-white grid place-items-center"><div className="text-sm text-slate-400">Loading LUMIA AI…</div></main>;
}
