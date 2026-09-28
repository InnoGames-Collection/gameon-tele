import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Users, 
  Activity, 
  ShieldAlert, 
  RefreshCw,
  Clock,
  Coins,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'CYCLES' | 'RUNS' | 'SUBSCRIBERS'>('DASHBOARD');
  const [metrics, setMetrics] = useState({
    activeSubscribers: 6420,
    totalPlayers: 11200,
    currentCycleNumber: 39,
    fraudIncidentsBlocked: 9,
    portalRevenueEtb: 12840,
  });
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
      const runsRes = await fetch('/api/admin/runs');
      if (runsRes.ok) {
        const data = await runsRes.json();
        setRuns(data);
      }
    } catch {
      // fallback in dev
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-rose-500/20">
              GO
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-white">GameOn Tele</h1>
              <p className="text-[11px] text-slate-400 font-medium">3D Tournament Console</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                activeTab === 'DASHBOARD' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Trophy size={18} /> Tournament Dashboard
            </button>
            <button
              onClick={() => setActiveTab('CYCLES')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                activeTab === 'CYCLES' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Clock size={18} /> 7-Day Competition Cycles
            </button>
            <button
              onClick={() => setActiveTab('RUNS')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                activeTab === 'RUNS' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Activity size={18} /> 3D Physics Telemetry
            </button>
            <button
              onClick={() => setActiveTab('SUBSCRIBERS')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                activeTab === 'SUBSCRIBERS' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Users size={18} /> Subscriber Ledger (9898)
            </button>
          </nav>
        </div>

        <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-rose-400 font-semibold mb-1">
            <Coins size={14} /> Weekly Pool: 40,000 ETB
          </div>
          <p className="text-[11px]">1st: 20k | 2nd: 12k | 3rd: 5k</p>
          <p className="text-[10px] text-slate-500 mt-1">Rolling 7-Day Cycle Engine</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex items-center justify-between pb-6 border-b border-slate-800 mb-8">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white capitalize">{activeTab.toLowerCase()}</h2>
            <p className="text-xs text-slate-400 mt-1">3D Helix Jump Competitive Tournament Administration</p>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Probes
          </button>
        </header>

        {activeTab === 'DASHBOARD' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Subscribers</span>
                <div className="text-3xl font-black text-white mt-2">{metrics.activeSubscribers.toLocaleString()}</div>
                <span className="inline-block mt-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Shortcode 9898 (2 ETB/day)
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Cycle</span>
                <div className="text-3xl font-black text-white mt-2">Week #{metrics.currentCycleNumber}</div>
                <span className="inline-block mt-2 text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                  Day 4 of 7 Active
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tournament Prize Pool</span>
                <div className="text-3xl font-black text-white mt-2">40,000 ETB</div>
                <span className="inline-block mt-2 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  10 Certified Payouts
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Physics Hacks Flagged</span>
                <div className="text-3xl font-black text-white mt-2">{metrics.fraudIncidentsBlocked}</div>
                <span className="inline-block mt-2 text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                  Drop-rate Guard Active
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Official 7-Day Prize Tier Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-amber-400 font-bold text-sm block">1st Place</span>
                  <span className="text-lg font-black text-white block mt-1">20,000 ETB</span>
                  <span className="text-slate-400 block mt-1">Certified Cash / Airtime</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-300 font-bold text-sm block">2nd Place</span>
                  <span className="text-lg font-black text-white block mt-1">12,000 ETB</span>
                  <span className="text-slate-400 block mt-1">Certified Cash / Airtime</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-amber-600 font-bold text-sm block">3rd Place</span>
                  <span className="text-lg font-black text-white block mt-1">5,000 ETB</span>
                  <span className="text-slate-400 block mt-1">Certified Cash / Airtime</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-purple-400 font-bold text-sm block">4th – 10th Place</span>
                  <span className="text-lg font-black text-white block mt-1">1,000 ETB each</span>
                  <span className="text-slate-400 block mt-1">Airtime Top-up</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'CYCLES' && (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top 10 Contenders (Cycle #39)</h3>
              <span className="text-xs text-rose-400 font-semibold">Ends in 3 days 14 hours</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5 font-semibold">Rank</th>
                  <th className="p-3.5 font-semibold">Masked MSISDN</th>
                  <th className="p-3.5 font-semibold">7-Day Cumulative Score</th>
                  <th className="p-3.5 font-semibold">Allocated Prize</th>
                  <th className="p-3.5 font-semibold">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {[
                  { rank: 1, msisdn: '091*****890', score: 4850, prize: '20,000 ETB', status: 'VERIFIED' },
                  { rank: 2, msisdn: '092*****412', score: 4320, prize: '12,000 ETB', status: 'VERIFIED' },
                  { rank: 3, msisdn: '093*****589', score: 3950, prize: '5,000 ETB', status: 'VERIFIED' },
                  { rank: 4, msisdn: '094*****633', score: 3420, prize: '1,000 ETB', status: 'VERIFIED' },
                  { rank: 5, msisdn: '095*****744', score: 3180, prize: '1,000 ETB', status: 'VERIFIED' },
                ].map((c) => (
                  <tr key={c.rank} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-black text-rose-400">#{c.rank}</td>
                    <td className="p-3.5 font-mono text-white">{c.msisdn}</td>
                    <td className="p-3.5 font-bold text-white">{c.score.toLocaleString()} pts</td>
                    <td className="p-3.5 font-bold text-emerald-400">{c.prize}</td>
                    <td className="p-3.5"><span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'RUNS' && (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">3D Physics Telemetry & Anti-Cheat Inspection</h3>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5 font-semibold">Player MSISDN</th>
                  <th className="p-3.5 font-semibold">Floors Cleared</th>
                  <th className="p-3.5 font-semibold">Score</th>
                  <th className="p-3.5 font-semibold">Duration</th>
                  <th className="p-3.5 font-semibold">Rate (s/floor)</th>
                  <th className="p-3.5 font-semibold">Anti-Cheat Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {[
                  { msisdn: '091*****890', floors: 42, score: 520, duration: '28.4s', rate: '0.67s', verified: true },
                  { msisdn: '092*****412', floors: 38, score: 480, duration: '24.1s', rate: '0.63s', verified: true },
                  { msisdn: '097*****001', floors: 95, score: 1850, duration: '4.2s', rate: '0.04s', verified: false },
                ].map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono text-white">{r.msisdn}</td>
                    <td className="p-3.5 text-slate-300">{r.floors} floors</td>
                    <td className="p-3.5 font-bold text-white">{r.score}</td>
                    <td className="p-3.5 text-slate-400">{r.duration}</td>
                    <td className="p-3.5 text-slate-400">{r.rate}</td>
                    <td className="p-3.5">
                      {r.verified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">
                          <CheckCircle size={12} /> Physics Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full font-semibold">
                          <AlertTriangle size={12} /> Impossible Speed Flagged
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'SUBSCRIBERS' && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Subscriber Billing Ledger</h3>
            <p>Monitors recurring 2 ETB/day charges processed via Ethio Telecom Shortcode 9898 and reported to the SP Gateway.</p>
          </div>
        )}
      </main>
    </div>
  );
}
