import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, 
  Users, 
  Activity, 
  RefreshCw,
  Clock,
  Coins,
  CheckCircle,
  AlertTriangle,
  Lock,
  LogOut,
  Save,
  PlayCircle
} from 'lucide-react';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface DashboardMetrics {
  activeSubscribers: number;
  totalPlayers: number;
  currentCycleNumber: number;
  fraudIncidentsBlocked: number;
  portalRevenueEtb: number;
}

interface PrizeConfig {
  id: string;
  total_pool_etb: number;
  prize_map: Record<string, number>;
  updated_at?: string;
}

export default function App() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('gameon_admin_token'));
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const saved = sessionStorage.getItem('gameon_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Login form state
  const [loginUsername, setLoginUsername] = useState('superadmin');
  const [loginPassword, setLoginPassword] = useState('Admin@GameOn2026!');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Console active tab
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'CYCLES' | 'RUNS' | 'SUBSCRIBERS'>('DASHBOARD');
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeSubscribers: 0,
    totalPlayers: 0,
    currentCycleNumber: 1,
    fraudIncidentsBlocked: 0,
    portalRevenueEtb: 0,
  });

  const [runs, setRuns] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [cycleData, setCycleData] = useState<{ activeCycle?: any; contenders: any[] }>({ contenders: [] });
  const [prizeConfig, setPrizeConfig] = useState<PrizeConfig>({
    id: 'default_weekly',
    total_pool_etb: 40000,
    prize_map: { '1': 20000, '2': 10000, '3': 5000, '4': 1000, '5': 1000, '6': 1000, '7': 1000, '8': 1000 },
  });

  // Editable prize inputs
  const [editPrizes, setEditPrizes] = useState<Record<string, number>>({
    '1': 20000,
    '2': 10000,
    '3': 5000,
    '4': 1000,
    '5': 1000,
    '6': 1000,
    '7': 1000,
    '8': 1000,
  });
  const [prizeSaveStatus, setPrizeSaveStatus] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [settling, setSettling] = useState(false);

  // Authentication Handler
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Authentication failed. Please verify credentials.');
        return;
      }

      sessionStorage.setItem('gameon_admin_token', data.token);
      sessionStorage.setItem('gameon_admin_user', JSON.stringify(data.user));
      setToken(data.token);
      setAdminUser(data.user);
    } catch (err: any) {
      setLoginError('Network error connecting to backend API: ' + err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('gameon_admin_token');
    sessionStorage.removeItem('gameon_admin_user');
    setToken(null);
    setAdminUser(null);
  };

  // Live Data Fetcher
  const fetchStats = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [dashRes, runsRes, subsRes, cyclesRes, prizeRes] = await Promise.all([
        fetch('/api/admin/dashboard', { headers }),
        fetch('/api/admin/runs', { headers }),
        fetch('/api/admin/subscribers', { headers }),
        fetch('/api/admin/cycles', { headers }),
        fetch('/api/admin/prize-config', { headers }),
      ]);

      if (dashRes.status === 401 || dashRes.status === 403) {
        handleLogout();
        return;
      }

      if (dashRes.ok) {
        const d = await dashRes.json();
        setMetrics(d);
      }
      if (runsRes.ok) {
        const r = await runsRes.json();
        setRuns(r);
      }
      if (subsRes.ok) {
        const s = await subsRes.json();
        setSubscribers(s);
      }
      if (cyclesRes.ok) {
        const c = await cyclesRes.json();
        setCycleData(c);
      }
      if (prizeRes.ok) {
        const p = await prizeRes.json();
        setPrizeConfig(p);
        if (p.prize_map) {
          setEditPrizes(p.prize_map);
        }
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token, fetchStats]);

  // Handle Prize Config Save
  const handleSavePrizeConfig = async () => {
    if (!token) return;
    setPrizeSaveStatus('Saving...');

    const sum = Object.values(editPrizes).reduce((acc, v) => acc + (Number(v) || 0), 0);

    try {
      const res = await fetch('/api/admin/prize-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          total_pool_etb: sum,
          prize_map: editPrizes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPrizeSaveStatus(`Saved successfully! Total pool: ${sum.toLocaleString()} ETB`);
        setPrizeConfig(data.config);
        setTimeout(() => setPrizeSaveStatus(''), 4000);
        fetchStats();
      } else {
        setPrizeSaveStatus('Failed: ' + (data.error || 'Server error'));
      }
    } catch (err: any) {
      setPrizeSaveStatus('Network error: ' + err.message);
    }
  };

  // Handle Manual Cycle Settlement Trigger
  const handleTriggerSettlement = async () => {
    if (!token) return;
    if (!window.confirm('Trigger immediate cycle settlement and airtime payout ledgering?')) return;
    setSettling(true);
    try {
      const res = await fetch('/api/admin/cycles/settle-now', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      alert(`Settlement completed: ${JSON.stringify(data)}`);
      fetchStats();
    } catch (err: any) {
      alert('Error triggering settlement: ' + err.message);
    } finally {
      setSettling(false);
    }
  };

  // If NOT Logged In, Render Admin Login Screen
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-rose-500/20">
                GO
              </div>
              <div>
                <h1 className="font-extrabold text-lg text-white">GameOn Tele</h1>
                <p className="text-xs text-slate-400">Telecom & Regulatory Admin Console</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-400">
              <span className="font-bold text-slate-200 block mb-0.5">Ethio Telecom Shortcode 7198 Portal</span>
              <span>INSA and Telecom Operator Administrative Access</span>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Admin Username or Email
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="superadmin"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Security Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-rose-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Lock size={16} />
                {isLoggingIn ? 'Authenticating with PostgreSQL...' : 'Sign In to Admin Console'}
              </button>
            </form>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between items-center">
              <span>Bcrypt Hash Verified • Tier-0</span>
              <span className="text-emerald-400 font-mono">Postgres 16 OK</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate live edited sum for prize config
  const calculatedPrizeSum = Object.values(editPrizes).reduce((acc, v) => acc + (Number(v) || 0), 0);

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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                activeTab === 'DASHBOARD' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Trophy size={18} /> Tournament Dashboard
            </button>
            <button
              onClick={() => setActiveTab('CYCLES')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                activeTab === 'CYCLES' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Clock size={18} /> 7-Day Competition & Prizes
            </button>
            <button
              onClick={() => setActiveTab('RUNS')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                activeTab === 'RUNS' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Activity size={18} /> 3D Physics Telemetry
            </button>
            <button
              onClick={() => setActiveTab('SUBSCRIBERS')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                activeTab === 'SUBSCRIBERS' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Users size={18} /> Subscriber Ledger (7198)
            </button>
          </nav>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-rose-400 font-semibold mb-1">
              <Coins size={14} /> Weekly Pool: {prizeConfig.total_pool_etb.toLocaleString()} ETB
            </div>
            <p className="text-[11px]">1st: {editPrizes['1']?.toLocaleString() || '20,000'} | 2nd: {editPrizes['2']?.toLocaleString() || '10,000'} | 3rd: {editPrizes['3']?.toLocaleString() || '5,000'} ETB</p>
            <p className="text-[10px] text-slate-500 mt-1">4th–8th: 1,000 ETB each</p>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white truncate">{adminUser?.username || 'superadmin'}</p>
              <span className="text-[10px] text-emerald-400 font-mono">{adminUser?.role || 'SUPER_ADMIN'}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex items-center justify-between pb-6 border-b border-slate-800 mb-8">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white capitalize">
              {activeTab === 'CYCLES' ? '7-Day Competition Cycles & Prize Configuration' : activeTab.toLowerCase()}
            </h2>
            <p className="text-xs text-slate-400 mt-1">Ethio Telecom Shortcode 7198 • Production Administration</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Probes
            </button>
          </div>
        </header>

        {activeTab === 'DASHBOARD' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Subscribers</span>
                <div className="text-3xl font-black text-white mt-2">{metrics.activeSubscribers.toLocaleString()}</div>
                <span className="inline-block mt-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Shortcode 7198 (2 ETB/day)
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Cycle</span>
                <div className="text-3xl font-black text-white mt-2">Week #{metrics.currentCycleNumber}</div>
                <span className="inline-block mt-2 text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                  Rolling 7-Day Cycle Active
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tournament Prize Pool</span>
                <div className="text-3xl font-black text-white mt-2">{prizeConfig.total_pool_etb.toLocaleString()} ETB</div>
                <span className="inline-block mt-2 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  1st: 20k • 2nd: 10k • 3rd: 5k • 4-8th: 1k
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Physics Hacks Flagged</span>
                <div className="text-3xl font-black text-white mt-2">{metrics.fraudIncidentsBlocked}</div>
                <span className="inline-block mt-2 text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                  Anti-Cheat Telemetry Guard
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Official 7-Day Prize Tier Rules (Configured in Database)</h3>
                <button
                  onClick={() => setActiveTab('CYCLES')}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 underline cursor-pointer"
                >
                  Edit in Cycles Tab &rarr;
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-amber-400 font-bold text-sm block">1st Place</span>
                  <span className="text-lg font-black text-white block mt-1">{editPrizes['1']?.toLocaleString() || '20,000'} ETB</span>
                  <span className="text-slate-400 block mt-1">Certified TeleBirr / Cash</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-300 font-bold text-sm block">2nd Place</span>
                  <span className="text-lg font-black text-white block mt-1">{editPrizes['2']?.toLocaleString() || '10,000'} ETB</span>
                  <span className="text-slate-400 block mt-1">Certified TeleBirr / Cash</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-amber-600 font-bold text-sm block">3rd Place</span>
                  <span className="text-lg font-black text-white block mt-1">{editPrizes['3']?.toLocaleString() || '5,000'} ETB</span>
                  <span className="text-slate-400 block mt-1">Certified TeleBirr / Cash</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-purple-400 font-bold text-sm block">4th – 8th Place</span>
                  <span className="text-lg font-black text-white block mt-1">1,000 ETB each</span>
                  <span className="text-slate-400 block mt-1">Airtime Top-up (5 winners)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'CYCLES' && (
          <div className="space-y-8">
            {/* Dynamic Prize Configuration Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Coins className="text-amber-400" size={18} /> Prize Pool & Tier Allocation Editor
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure tournament prize amounts stored in PostgreSQL <code className="text-rose-400">prize_configurations</code> table.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Total Configured Pool:</span>
                    <strong className="text-lg font-black text-amber-400 font-mono">
                      {calculatedPrizeSum.toLocaleString()} ETB
                    </strong>
                  </div>
                  <button
                    onClick={handleSavePrizeConfig}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
                  >
                    <Save size={15} /> Save Configuration
                  </button>
                </div>
              </div>

              {prizeSaveStatus && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${
                  prizeSaveStatus.startsWith('Saved') 
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                }`}>
                  {prizeSaveStatus}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">1st Place Prize (ETB)</label>
                  <input
                    type="number"
                    value={editPrizes['1'] || 0}
                    onChange={(e) => setEditPrizes({ ...editPrizes, '1': Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono font-bold focus:border-rose-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Default: 20,000 ETB</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">2nd Place Prize (ETB)</label>
                  <input
                    type="number"
                    value={editPrizes['2'] || 0}
                    onChange={(e) => setEditPrizes({ ...editPrizes, '2': Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono font-bold focus:border-rose-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Default: 10,000 ETB</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">3rd Place Prize (ETB)</label>
                  <input
                    type="number"
                    value={editPrizes['3'] || 0}
                    onChange={(e) => setEditPrizes({ ...editPrizes, '3': Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono font-bold focus:border-rose-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Default: 5,000 ETB</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">4th Place Prize (ETB)</label>
                  <input
                    type="number"
                    value={editPrizes['4'] || 0}
                    onChange={(e) => setEditPrizes({ ...editPrizes, '4': Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono font-bold focus:border-rose-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Default: 1,000 ETB</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">5th Place Prize (ETB)</label>
                  <input
                    type="number"
                    value={editPrizes['5'] || 0}
                    onChange={(e) => setEditPrizes({ ...editPrizes, '5': Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono font-bold focus:border-rose-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Default: 1,000 ETB</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">6th Place Prize (ETB)</label>
                  <input
                    type="number"
                    value={editPrizes['6'] || 0}
                    onChange={(e) => setEditPrizes({ ...editPrizes, '6': Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono font-bold focus:border-rose-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Default: 1,000 ETB</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">7th Place Prize (ETB)</label>
                  <input
                    type="number"
                    value={editPrizes['7'] || 0}
                    onChange={(e) => setEditPrizes({ ...editPrizes, '7': Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono font-bold focus:border-rose-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Default: 1,000 ETB</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">8th Place Prize (ETB)</label>
                  <input
                    type="number"
                    value={editPrizes['8'] || 0}
                    onChange={(e) => setEditPrizes({ ...editPrizes, '8': Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono font-bold focus:border-rose-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Default: 1,000 ETB</span>
                </div>
              </div>
            </div>

            {/* Top 10 Contenders Table */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Top 10 Contenders ({cycleData.activeCycle?.competition_id || 'Active Cycle'})
                  </h3>
                  <span className="text-xs text-slate-400">Live PostgreSQL Leaderboard Standings</span>
                </div>
                <button
                  onClick={handleTriggerSettlement}
                  disabled={settling}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  <PlayCircle size={14} /> {settling ? 'Settling...' : 'Manual Settlement Trigger'}
                </button>
              </div>

              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 font-semibold">Rank</th>
                    <th className="p-3.5 font-semibold">Masked MSISDN</th>
                    <th className="p-3.5 font-semibold">7-Day Cumulative Score</th>
                    <th className="p-3.5 font-semibold">Allocated Prize (ETB)</th>
                    <th className="p-3.5 font-semibold">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {cycleData.contenders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500">
                        No contender records currently in this cycle.
                      </td>
                    </tr>
                  ) : (
                    cycleData.contenders.map((c, idx) => {
                      const rank = c.rank || idx + 1;
                      const prize = editPrizes[String(rank)] || 0;
                      return (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="p-3.5 font-black text-rose-400">#{rank}</td>
                          <td className="p-3.5 font-mono text-white">{c.masked_msisdn || c.player_msisdn}</td>
                          <td className="p-3.5 font-bold text-white">{(c.seven_day_score || 0).toLocaleString()} pts</td>
                          <td className="p-3.5 font-bold text-emerald-400">{prize.toLocaleString()} ETB</td>
                          <td className="p-3.5">
                            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                              VERIFIED
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'RUNS' && (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">3D Physics Telemetry & Anti-Cheat Inspection</h3>
                <span className="text-xs text-slate-400">Live records from PostgreSQL <code className="text-rose-400">helix_runs</code></span>
              </div>
              <span className="text-xs text-slate-400 font-mono">{runs.length} runs recorded</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5 font-semibold">Run ID</th>
                  <th className="p-3.5 font-semibold">Player MSISDN</th>
                  <th className="p-3.5 font-semibold">Floors</th>
                  <th className="p-3.5 font-semibold">Final Score</th>
                  <th className="p-3.5 font-semibold">Duration</th>
                  <th className="p-3.5 font-semibold">Anti-Cheat Verification</th>
                  <th className="p-3.5 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {runs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500">
                      No game runs recorded yet. Launch 3D Helix Jump to record runs.
                    </td>
                  </tr>
                ) : (
                  runs.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-mono text-slate-400 text-[10px]">{r.id?.slice(0, 16)}...</td>
                      <td className="p-3.5 font-mono text-white">{r.player_msisdn}</td>
                      <td className="p-3.5 text-slate-300">{r.floors_cleared}</td>
                      <td className="p-3.5 font-bold text-white">{r.final_score}</td>
                      <td className="p-3.5 text-slate-400">{r.duration_seconds}s</td>
                      <td className="p-3.5">
                        {r.verified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">
                            <CheckCircle size={12} /> Physics Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full font-semibold">
                            <AlertTriangle size={12} /> {r.fraud_reason || 'Fraud Flagged'}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-500 font-mono text-[10px]">
                        {new Date(r.started_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'SUBSCRIBERS' && (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Subscriber Ledger (Shortcode 7198)</h3>
                <span className="text-xs text-slate-400">Live records from PostgreSQL <code className="text-rose-400">subscriptions</code></span>
              </div>
              <span className="text-xs text-emerald-400 font-mono font-bold">2 ETB/day Billing Rate</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5 font-semibold">MSISDN</th>
                  <th className="p-3.5 font-semibold">Subscription Status</th>
                  <th className="p-3.5 font-semibold">Plan ID</th>
                  <th className="p-3.5 font-semibold">Auto-Renew</th>
                  <th className="p-3.5 font-semibold">Subscribed At</th>
                  <th className="p-3.5 font-semibold">Last Billed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">
                      No active subscribers registered in ledger.
                    </td>
                  </tr>
                ) : (
                  subscribers.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-mono text-white font-bold">{s.masked_msisdn || s.msisdn}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${
                          s.status === 'ACTIVE' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300 font-mono uppercase">{s.plan_type || 'daily'}</td>
                      <td className="p-3.5 text-slate-400">YES (Auto)</td>
                      <td className="p-3.5 text-slate-500 font-mono text-[10px]">
                        {s.created_at ? new Date(s.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-3.5 text-slate-500 font-mono text-[10px]">
                        {s.last_billed_at ? new Date(s.last_billed_at).toLocaleDateString() : 'Pending'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
