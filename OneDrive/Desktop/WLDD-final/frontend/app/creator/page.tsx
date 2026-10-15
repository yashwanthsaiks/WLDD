'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../services/api';
import { Campaign } from '../../types';
import { Sparkles, Send, LogOut } from 'lucide-react';

export default function CreatorDashboard() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [postLinks, setPostLinks] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const [creatorName, setCreatorName] = useState<string>('Creator');

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('/creator/campaigns');
      console.log('Fetched campaigns:', res.data); // Log to verify backend output
      setCampaigns(res.data);
    } catch (err: any) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const storedName = localStorage.getItem('name');

      if (storedName) {
        setCreatorName(storedName);
      }

      if (!token || role !== 'creator') {
        router.push('/auth');
        return;
      }
    }
    fetchCampaigns();
  }, [router]);

  const handleSubmission = async (campaignId: string) => {
    if (!campaignId) {
      alert('Invalid Campaign ID. Please refresh your page.');
      return;
    }

    const link = postLinks[campaignId];
    if (!link || link.trim() === '') {
      alert('Please enter your meme post link first.');
      return;
    }

    setSubmittingId(campaignId);
    try {
      await api.post('/creator/submissions', {
        campaignId: campaignId,
        postLink: link
      });
      alert('Successfully joined campaign and submitted post!');
      setPostLinks({ ...postLinks, [campaignId]: '' });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/auth');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      {/* Header */}
      <header className="max-w-5xl mx-auto flex items-center justify-between pb-6 border-b border-slate-800/80 mb-8">
        <div>
          <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            Creator Marketplace
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-1">Hello, {creatorName}</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 transition"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      {/* Campaign Marketplace List */}
      <div className="max-w-5xl mx-auto space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" /> Live Campaigns
        </h2>

        {loading ? (
          <p className="text-sm text-slate-500">Loading marketplace campaigns...</p>
        ) : campaigns.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-400">
            No live campaigns available right now. Check back soon!
          </div>
        ) : (
          campaigns.map((camp, idx) => {
            // Robustly extract ID regardless of whether backend returns _id or id
            const campaignIdStr = (camp._id || (camp as any).id || '').toString();

            return (
              <div
                key={campaignIdStr || `camp-${idx}`}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 hover:border-slate-700 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {camp.platform}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">{camp.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Remaining Pool</span>
                    <span className="text-lg font-bold text-emerald-400">${camp.remainingBudget}</span>
                  </div>
                </div>

                {/* Milestones Preview */}
                <div className="grid grid-cols-3 gap-3">
                  {camp.milestones && camp.milestones.map((m, mIdx) => (
                    <div key={mIdx} className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl text-center">
                      <span className="text-xs text-slate-400 block">
                        {(m.views ?? 0).toLocaleString()} views
                      </span>
                      <span className="text-sm font-bold text-indigo-400">${m.payout ?? 0}</span>
                    </div>
                  ))}
                </div>

                {/* Submit Post Form */}
                <div className="flex gap-3 pt-2 border-t border-slate-800/60">
                  <input
                    type="url"
                    placeholder="Paste your meme post link (https://...)"
                    value={postLinks[campaignIdStr] || ''}
                    onChange={(e) => setPostLinks({ ...postLinks, [campaignIdStr]: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => handleSubmission(campaignIdStr)}
                    disabled={submittingId === campaignIdStr}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" /> {submittingId === campaignIdStr ? 'Joining...' : 'Join Campaign'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}