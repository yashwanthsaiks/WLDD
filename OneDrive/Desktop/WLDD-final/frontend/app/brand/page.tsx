'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../services/api';
import { Campaign, Milestone } from '../../types';
import { PlusCircle, Layers, LogOut, Users, ExternalLink } from 'lucide-react';

interface Submission {
  _id: string;
  campaignId: {
    _id: string;
    name: string;
    platform: string;
  };
  creatorId: {
    _id: string;
    name: string;
    email: string;
    contactDetails?: string;
  };
  postLink: string;
  createdAt: string;
}

export default function BrandDashboard() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const [brandName, setBrandName] = useState<string>('Brand');

  // Form State
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<'Instagram' | 'YouTube'>('Instagram');
  const [totalBudget, setTotalBudget] = useState<number>(5000);
  const [milestones] = useState<Milestone[]>([
    { views: 10000, payout: 500 },
    { views: 50000, payout: 2000 },
    { views: 100000, payout: 5000 }
  ]);

  const fetchData = async () => {
    try {
      const campRes = await api.get('/brand/campaigns');
      setCampaigns(campRes.data);

      // Fetch submissions for brand campaigns if endpoint exists
      try {
        const subRes = await api.get('/brand/submissions');
        setSubmissions(subRes.data);
      } catch (subErr) {
        console.log('Submissions endpoint might need setup or is empty:', subErr);
      }
    } catch (err: any) {
      console.error('Error fetching brand data:', err);
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
        setBrandName(storedName);
      }

      if (!token || role !== 'brand') {
        router.push('/auth');
        return;
      }
    }
    fetchData();
  }, [router]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/brand/campaigns', {
        name,
        platform,
        totalBudget: Number(totalBudget),
        milestones
      });
      setName('');
      alert('Campaign created successfully!');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error creating campaign');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/auth');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <header className="max-w-6xl mx-auto flex items-center justify-between pb-6 border-b border-slate-800/80 mb-8">
        <div>
          <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider">
            Brand Portal
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-1">Welcome back, {brandName}</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 transition"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Campaign Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <PlusCircle className="w-5 h-5 text-purple-400" /> Create Campaign
          </h2>

          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Campaign Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500"
                placeholder="e.g. Summer Energy Push"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as 'Instagram' | 'YouTube')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 text-slate-200"
              >
                <option value="Instagram">Instagram</option>
                <option value="YouTube">YouTube</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Total Budget ($)</label>
              <input
                type="number"
                required
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-purple-600/20 text-sm mt-2"
            >
              Launch Campaign
            </button>
          </form>
        </div>

        {/* Campaigns & Creator Submissions Feed */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Campaigns List */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" /> Active Campaigns ({campaigns.length})
            </h2>

            {loading ? (
              <p className="text-sm text-slate-500">Loading campaigns...</p>
            ) : campaigns.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-400">
                No campaigns created yet. Use the form to launch your first milestone campaign!
              </div>
            ) : (
              campaigns.map((camp, idx) => {
                const campKey = camp._id ? camp._id.toString() : `camp-${idx}`;
                return (
                  <div key={campKey} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 hover:border-slate-700 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {camp.platform}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-1">{camp.name}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Remaining Budget</span>
                        <span className="text-lg font-bold text-emerald-400">${camp.remainingBudget}</span> /${camp.totalBudget}
                      </div>
                    </div>

                    {/* Milestone Ladders View */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Milestone Ladder</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {camp.milestones && camp.milestones.map((m, mIdx) => (
                          <div key={mIdx} className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl text-center">
                            <span className="text-xs text-slate-400 block">
                              {(m.views ?? 0).toLocaleString()} views
                            </span>
                            <span className="text-sm font-bold text-purple-400">${m.payout ?? 0}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Creator Submissions / Activity Feed */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" /> Creator Submissions Feed
            </h2>

            {submissions.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 text-center text-slate-400 text-sm">
                No creators have joined your campaigns yet. When creators submit links, they will appear here!
              </div>
            ) : (
              submissions.map((sub, idx) => (
                <div key={sub._id || idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-indigo-400 font-medium">
                      Campaign: {sub.campaignId?.name || 'Campaign'}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                      Creator: <span className="text-purple-300">{sub.creatorId?.name || 'Unknown Creator'}</span>
                    </h4>
                    {sub.creatorId?.contactDetails && (
                      <span className="text-xs text-slate-400 block mt-0.5">
                        Contact: {sub.creatorId.contactDetails}
                      </span>
                    )}
                  </div>
                  <a
                    href={sub.postLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg text-xs font-medium transition"
                  >
                    View Post <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}