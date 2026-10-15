'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

/**
 * Root Landing / Auto-Redirect Page
 * Checks local authentication and redirects logged-in users to their role dashboard,
 * or displays a modern hero landing screen with a call to action.
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      if (token && role) {
        if (role === 'brand') {
          router.push('/brand');
        } else if (role === 'creator') {
          router.push('/creator');
        }
      }
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Glow Effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-3xl w-full text-center space-y-8 relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" /> Creator & Brand Marketplace Platform
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Milestone-based Campaign Payouts for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Creators & Brands</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
          Meme’d connects brands with viral content creators through financial budget-capped milestone ladders and real-time payout tracking.
        </p>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link
            href="/auth"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-xl shadow-indigo-600/20 text-base w-full sm:w-auto"
          >
            Launch Marketplace <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </main>
  );
}