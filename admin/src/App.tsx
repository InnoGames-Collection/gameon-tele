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
  PlayCircle,
  ShieldAlert,
  CreditCard,
  Eye,
  Ban,
  Check,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter
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
  totalPrizesDisbursedEtb?: number;
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
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'CYCLES' | 'CHEATER_QUEUE' | 'RUNS' | 'SUBSCRIBERS' | 'PAYOUTS'>('DASHBOARD');
  
  // Dashboard & Cycles state
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeSubscribers: 0,
    totalPlayers: 0,
    currentCycleNumber: 1,
    fraudIncidentsBlocked: 0,
    portalRevenueEtb: 0,
    totalPrizesDisbursedEtb: 0,
  });

  const [cycleData, setCycleData] = useState<{ activeCycle?: any; contenders: any[] }>({ contenders: [] });
  const [prizeConfig, setPrizeConfig] = useState<PrizeConfig>({
    id: 'default_weekly',
    total_pool_etb: 40000,
    prize_map: { '1': 20000, '2': 10000, '3': 5000, '4': 1000, '5': 1000, '6': 1000, '7': 1000, '8': 1000 },
  });

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

  // Paginated Lists state
  const [runs, setRuns] = useState<any[]>([]);
  const [runsTotal, setRunsTotal] = useState(0);
  const [runsPage, setRunsPage] = useState(1);

  const [cheaters, setCheaters] = useState<any[]>([]);
  const [cheatersTotal, setCheatersTotal] = useState(0);
  const [cheatersPage, setCheatersPage] = useState(1);

  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [subscribersTotal, setSubscribersTotal] = useState(0);
  const [subscribersPage, setSubscribersPage] = useState(1);
  const [subscribersStatusFilter, setSubscribersStatusFilter] = useState('');

  const [payouts, setPayouts] = useState<any[]>([]);
  const [payoutsTotal, setPayoutsTotal] = useState(0);
  const [payoutsPage, setPayoutsPage] = useState(1);
  const [payoutsStatusFilter, setPayoutsStatusFilter] = useState('');

  // Modals & Action States
  const [selectedInspectionRun, setSelectedInspectionRun] = useState<any | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  const [unmaskTarget, setUnmaskTarget] = useState<{ type: string; id: string } | null>(null);
  const [unmaskJustification, setUnmaskJustification] = useState('Regulatory verification');
  const [unmaskedResult, setUnmaskedResult] = useState<string | null>(null);
  const [unmasking, setUnmasking] = useState(false);

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

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      } catch {}
    }
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
      // 1. Core metrics & cycles
      const [dashRes, cyclesRes, prizeRes] = await Promise.all([
        fetch('/api/admin/dashboard', { headers }),
        fetch('/api/admin/cycles', { headers }),
        fetch('/api/admin/prize-config', { headers }),
      ]);

      if (dashRes.status === 401 || dashRes.status === 403) {
        handleLogout();
        return;
      }

      if (dashRes.ok) {
        setMetrics(await dashRes.json());
      }
      if (cyclesRes.ok) {
        setCycleData(await cyclesRes.json());
      }
      if (prizeRes.ok) {
        const p = await prizeRes.json();
        setPrizeConfig(p);
        if (p.prize_map) setEditPrizes(p.prize_map);
      }

      // 2. Tab-specific paginated fetches
      if (activeTab === 'CHEATER_QUEUE') {
        const qRes = await fetch(`/api/admin/cheater-queue?page=${cheatersPage}&limit=15`, { headers });
        if (qRes.ok) {
          const q = await qRes.json();
          setCheaters(q.queue || []);
          setCheatersTotal(q.total || 0);
        }
      } else if (activeTab === 'RUNS') {
        const rRes = await fetch(`/api/admin/runs?page=${runsPage}&limit=15`, { headers });
        if (rRes.ok) {
          const r = await rRes.json();
          setRuns(r.runs || []);
          setRunsTotal(r.total || 0);
        }
      } else if (activeTab === 'SUBSCRIBERS') {
        const url = `/api/admin/subscribers?page=${subscribersPage}&limit=15${subscribersStatusFilter ? `&status=${subscribersStatusFilter}` : ''}`;
        const sRes = await fetch(url, { headers });
        if (sRes.ok) {
          const s = await sRes.json();
          setSubscribers(s.subscribers || []);
          setSubscribersTotal(s.total || 0);
        }
      } else if (activeTab === 'PAYOUTS') {
        const url = `/api/admin/payouts?page=${payoutsPage}&limit=15${payoutsStatusFilter ? `&status=${payoutsStatusFilter}` : ''}`;
        const pRes = await fetch(url, { headers });
        if (pRes.ok) {
          const p = await pRes.json();
          setPayouts(p.payouts || []);
          setPayoutsTotal(p.total || 0);
        }
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  }, [token, activeTab, cheatersPage, runsPage, subscribersPage, subscribersStatusFilter, payoutsPage, payoutsStatusFilter]);

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
    if (!window.confirm('Trigger immediate 7-day cycle settlement and ledger airtime payouts?')) return;
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

  // Cheater Action Execution
  const handleExecuteCheaterAction = async (action: 'confirm_disqualification' | 'ban_msisdn' | 'dismiss_flag') => {
    if (!selectedInspectionRun || !token) return;
    if (!actionReason.trim()) {
      alert('Please provide an operational justification reason for audit logging.');
      return;
    }

    setActionInProgress(true);
    try {
      const res = await fetch(`/api/admin/cheater-queue/${selectedInspectionRun.id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action, reason: actionReason }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Success: ${data.message}`);
        setSelectedInspectionRun(null);
        setActionReason('');
        fetchStats();
      } else {
        alert(`Action failed: ${data.error || data.message}`);
      }
    } catch (err: any) {
      alert('Network error executing cheater action: ' + err.message);
    } finally {
      setActionInProgress(false);
    }
  };

  // PII Unmasking Action
  const handleUnmaskMsisdn = async () => {
    if (!unmaskTarget || !token) return;
    setUnmasking(true);
    try {
      const res = await fetch('/api/admin/unmask-msisdn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetType: unmaskTarget.type,
          targetId: unmaskTarget.id,
          justification: unmaskJustification,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUnmaskedResult(data.formattedPhone || data.unmaskedMsisdn);
      } else {
        alert('Unmasking failed: ' + (data.error || 'Server error'));
      }
    } catch (err: any) {
      alert('Network error during unmask request: ' + err.message);
    } finally {
      setUnmasking(false);
    }
  };

  // Airtime Payout Retry
  const handleRetryPayout = async (payoutId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}/retry`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Disbursement command dispatched successfully to Telecom SP Gateway.');
      } else {
        alert('Disbursement retry failed: ' + (data.error || 'Server error'));
      }
      fetchStats();
    } catch (err: any) {
      alert('Network error retrying payout: ' + err.message);
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

  const calculatedPrizeSum = Object.values(editPrizes).reduce((acc, v) => acc + (Number(v) || 0), 0);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
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
              <Clock size={18} /> 7-Day Cycles & Prizes
            </button>
            <button
              onClick={() => setActiveTab('CHEATER_QUEUE')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                activeTab === 'CHEATER_QUEUE' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <ShieldAlert size={18} /> Cheater Queue
              {metrics.fraudIncidentsBlocked > 0 && (
                <span className="ml-auto bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {metrics.fraudIncidentsBlocked}
                </span>
              )}
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
              <Users size={18} /> Subscriber Ledger
            </button>
            <button
              onClick={() => setActiveTab('PAYOUTS')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                activeTab === 'PAYOUTS' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <CreditCard size={18} /> Airtime Settlement
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
              {activeTab === 'CYCLES' ? '7-Day Competition Cycles & Prize Configuration' :
               activeTab === 'CHEATER_QUEUE' ? 'Anti-Cheat Fraud Queue & Disqualification' :
               activeTab === 'PAYOUTS' ? 'Outbound Airtime Settlement Ledger' :
               activeTab.toLowerCase().replace('_', ' ')}
            </h2>
            <p className="text-xs text-slate-400 mt-1">Ethio Telecom Shortcode 7198 • Zero-Trust Operations</p>
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

        {/* ── 1. DASHBOARD TAB ──────────────────────────────────────────────── */}
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
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Official 7-Day Prize Tier Rules (PostgreSQL 16)</h3>
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
                  <span className="text-slate-400 block mt-1">TeleBirr / Cash Disbursement</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-300 font-bold text-sm block">2nd Place</span>
                  <span className="text-lg font-black text-white block mt-1">{editPrizes['2']?.toLocaleString() || '10,000'} ETB</span>
                  <span className="text-slate-400 block mt-1">TeleBirr / Cash Disbursement</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-amber-600 font-bold text-sm block">3rd Place</span>
                  <span className="text-lg font-black text-white block mt-1">{editPrizes['3']?.toLocaleString() || '5,000'} ETB</span>
                  <span className="text-slate-400 block mt-1">TeleBirr / Cash Disbursement</span>
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

        {/* ── 2. CYCLES & PRIZES TAB ────────────────────────────────────────── */}
        {activeTab === 'CYCLES' && (
          <div className="space-y-8">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Coins className="text-amber-400" size={18} /> Prize Pool & Tier Allocation Editor
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure tournament prize amounts stored in PostgreSQL <code className="text-rose-400">prize_configurations</code>.
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
                {[1, 2, 3, 4, 5, 6, 7, 8].map((rank) => (
                  <div key={rank}>
                    <label className="block text-slate-300 font-bold mb-1">
                      {rank === 1 ? '1st Place (ETB)' : rank === 2 ? '2nd Place (ETB)' : rank === 3 ? '3rd Place (ETB)' : `${rank}th Place (ETB)`}
                    </label>
                    <input
                      type="number"
                      value={editPrizes[String(rank)] || 0}
                      onChange={(e) => setEditPrizes({ ...editPrizes, [String(rank)]: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono font-bold focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Contenders Table */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Top 10 Contenders ({cycleData.activeCycle?.competition_id || 'Active Cycle'})
                  </h3>
                  <span className="text-xs text-slate-400">Authoritative Leaderboard Standings</span>
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
                    <th className="p-3.5 font-semibold">Actions</th>
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
                            <button
                              onClick={() => {
                                setUnmaskTarget({ type: 'player', id: c.player_msisdn });
                                setUnmaskedResult(null);
                              }}
                              className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              <Eye size={13} /> Unmask
                            </button>
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

        {/* ── 3. CHEATER QUEUE TAB (ROLE 5 MANDATE) ─────────────────────────── */}
        {activeTab === 'CHEATER_QUEUE' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3">
              <ShieldAlert size={20} className="shrink-0 text-rose-400" />
              <span>
                <strong>Anti-Cheat Fraud Inspection Queue:</strong> Runs flagged by server physics telemetry verification (instant gravity violations, hazard collisions, or velocity tampering).
              </span>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Flagged Incidents</h3>
                  <span className="text-xs text-slate-400">Total Flagged: {cheatersTotal} runs</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={cheatersPage <= 1}
                    onClick={() => setCheatersPage((p) => p - 1)}
                    className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 text-slate-300 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-mono text-slate-400">Page {cheatersPage}</span>
                  <button
                    disabled={cheatersPage * 15 >= cheatersTotal}
                    onClick={() => setCheatersPage((p) => p + 1)}
                    className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 text-slate-300 cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 font-semibold">Run ID</th>
                    <th className="p-3.5 font-semibold">Masked MSISDN</th>
                    <th className="p-3.5 font-semibold">Floors</th>
                    <th className="p-3.5 font-semibold">Score</th>
                    <th className="p-3.5 font-semibold">Duration</th>
                    <th className="p-3.5 font-semibold">Fraud Reason</th>
                    <th className="p-3.5 font-semibold">Player Status</th>
                    <th className="p-3.5 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {cheaters.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-500">
                        Zero fraudulent runs currently pending in inspection queue. Anti-cheat engine secure.
                      </td>
                    </tr>
                  ) : (
                    cheaters.map((ch, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-3.5 font-mono text-slate-400 text-[11px]">{ch.id?.slice(0, 16)}...</td>
                        <td className="p-3.5 font-mono text-white">{ch.maskedMsisdn}</td>
                        <td className="p-3.5 text-slate-300">{ch.floorsCleared}</td>
                        <td className="p-3.5 font-bold text-rose-400">{ch.finalScore}</td>
                        <td className="p-3.5 text-slate-400">{ch.durationSeconds}s</td>
                        <td className="p-3.5 text-rose-400 font-semibold">{ch.fraudReason}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            ch.playerStatus === 'BANNED' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {ch.playerStatus}
                          </span>
                        </td>
                        <td className="p-3.5 flex items-center gap-2">
                          <button
                            onClick={() => setSelectedInspectionRun(ch)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-[11px] cursor-pointer"
                          >
                            Inspect & Act
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Inspection & Action Modal */}
            {selectedInspectionRun && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <ShieldAlert className="text-rose-500" size={18} /> Telemetry Trace & Velocity Inspection
                      </h3>
                      <p className="text-xs text-slate-400">Run: {selectedInspectionRun.id} • Player: {selectedInspectionRun.maskedMsisdn}</p>
                    </div>
                    <button
                      onClick={() => setSelectedInspectionRun(null)}
                      className="text-slate-400 hover:text-white text-sm"
                    >
                      &times;
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-500/30 space-y-2">
                    <span className="text-[11px] text-rose-400 font-bold block uppercase tracking-wider">Detection Reason:</span>
                    <p className="text-sm text-white font-mono">{selectedInspectionRun.fraudReason}</p>
                    <div className="flex gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
                      <span>Reported Duration: <strong>{selectedInspectionRun.durationSeconds}s</strong></span>
                      <span>Server Elapsed: <strong>{((selectedInspectionRun.serverDurationMs || 0) / 1000).toFixed(2)}s</strong></span>
                      <span>Floors: <strong>{selectedInspectionRun.floorsCleared}</strong></span>
                    </div>
                  </div>

                  {/* Ballistic Velocity Steps */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Descent Step Velocities</h4>
                    <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/40 p-2 text-xs font-mono">
                      {selectedInspectionRun.velocityGraph && selectedInspectionRun.velocityGraph.length > 0 ? (
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-slate-500 border-b border-slate-800">
                              <th className="p-1">Floor</th>
                              <th className="p-1">Action</th>
                              <th className="p-1">Delta T</th>
                              <th className="p-1">Velocity (u/s)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedInspectionRun.velocityGraph.map((vg: any, idx: number) => (
                              <tr key={idx} className="border-b border-slate-800/40">
                                <td className="p-1 text-white">Floor {vg.floor}</td>
                                <td className="p-1 text-slate-300">{vg.action}</td>
                                <td className={`p-1 ${vg.dtMs < 85 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>{vg.dtMs}ms</td>
                                <td className="p-1 text-amber-400">{vg.velocityUnitsPerSec}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-slate-500 p-2">Zero telemetry steps recorded (Instant memory injection).</p>
                      )}
                    </div>
                  </div>

                  {/* Operator Action Controls */}
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Operator Action Justification (Mandatory Audit Trail)
                    </label>
                    <input
                      type="text"
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="e.g. Confirmed instantaneous memory acceleration at floor 14"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500"
                    />

                    <div className="flex gap-3 pt-2">
                      <button
                        disabled={actionInProgress}
                        onClick={() => handleExecuteCheaterAction('confirm_disqualification')}
                        className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
                      >
                        Confirm Disqualification
                      </button>
                      <button
                        disabled={actionInProgress}
                        onClick={() => handleExecuteCheaterAction('ban_msisdn')}
                        className="flex-1 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
                      >
                        Ban MSISDN
                      </button>
                      <button
                        disabled={actionInProgress}
                        onClick={() => handleExecuteCheaterAction('dismiss_flag')}
                        className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer disabled:opacity-50"
                      >
                        Dismiss Flag
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 4. 3D PHYSICS TELEMETRY / RUNS TAB ────────────────────────────── */}
        {activeTab === 'RUNS' && (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">All Game Runs</h3>
                <span className="text-xs text-slate-400">Total Recorded: {runsTotal} runs</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={runsPage <= 1}
                  onClick={() => setRunsPage((p) => p - 1)}
                  className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 text-slate-300 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-mono text-slate-400">Page {runsPage}</span>
                <button
                  disabled={runsPage * 15 >= runsTotal}
                  onClick={() => setRunsPage((p) => p + 1)}
                  className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 text-slate-300 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5 font-semibold">Run ID</th>
                  <th className="p-3.5 font-semibold">Player MSISDN</th>
                  <th className="p-3.5 font-semibold">Floors</th>
                  <th className="p-3.5 font-semibold">Final Score</th>
                  <th className="p-3.5 font-semibold">Duration</th>
                  <th className="p-3.5 font-semibold">Verification</th>
                  <th className="p-3.5 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {runs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500">
                      No game runs recorded yet.
                    </td>
                  </tr>
                ) : (
                  runs.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-mono text-slate-400 text-[10px]">{r.id?.slice(0, 16)}...</td>
                      <td className="p-3.5 font-mono text-white">{r.masked_msisdn}</td>
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

        {/* ── 5. SUBSCRIBER LEDGER TAB ──────────────────────────────────────── */}
        {activeTab === 'SUBSCRIBERS' && (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Subscriber Ledger (Shortcode 7198)</h3>
                <span className="text-xs text-slate-400">Total Registered: {subscribersTotal} subscribers</span>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={subscribersStatusFilter}
                  onChange={(e) => {
                    setSubscribersStatusFilter(e.target.value);
                    setSubscribersPage(1);
                  }}
                  className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="UNSUBSCRIBED">UNSUBSCRIBED</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>

                <div className="flex items-center gap-1">
                  <button
                    disabled={subscribersPage <= 1}
                    onClick={() => setSubscribersPage((p) => p - 1)}
                    className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 text-slate-300 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-mono text-slate-400">Page {subscribersPage}</span>
                  <button
                    disabled={subscribersPage * 15 >= subscribersTotal}
                    onClick={() => setSubscribersPage((p) => p + 1)}
                    className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 text-slate-300 cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5 font-semibold">Masked MSISDN</th>
                  <th className="p-3.5 font-semibold">Status</th>
                  <th className="p-3.5 font-semibold">Plan ID</th>
                  <th className="p-3.5 font-semibold">Daily Rate</th>
                  <th className="p-3.5 font-semibold">Subscribed At</th>
                  <th className="p-3.5 font-semibold">Last Billed</th>
                  <th className="p-3.5 font-semibold">PII Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500">
                      No subscribers matching filter.
                    </td>
                  </tr>
                ) : (
                  subscribers.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-mono text-white font-bold">{s.display_msisdn}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${
                          s.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300 font-mono uppercase">{s.plan_type || 'daily'}</td>
                      <td className="p-3.5 text-emerald-400 font-mono font-bold">2.00 ETB</td>
                      <td className="p-3.5 text-slate-500 font-mono text-[10px]">
                        {s.created_at ? new Date(s.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-3.5 text-slate-500 font-mono text-[10px]">
                        {s.last_billed_at ? new Date(s.last_billed_at).toLocaleDateString() : 'Pending'}
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => {
                            setUnmaskTarget({ type: 'subscription', id: s.id });
                            setUnmaskedResult(null);
                          }}
                          className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={13} /> Unmask
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── 6. AIRTIME SETTLEMENT TAB ─────────────────────────────────────── */}
        {activeTab === 'PAYOUTS' && (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Airtime Settlement Ledger</h3>
                <span className="text-xs text-slate-400">Total Disbursements: {payoutsTotal} transactions</span>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={payoutsStatusFilter}
                  onChange={(e) => {
                    setPayoutsStatusFilter(e.target.value);
                    setPayoutsPage(1);
                  }}
                  className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300"
                >
                  <option value="">All Statuses</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="PENDING">PENDING</option>
                  <option value="FAILED">FAILED</option>
                </select>

                <div className="flex items-center gap-1">
                  <button
                    disabled={payoutsPage <= 1}
                    onClick={() => setPayoutsPage((p) => p - 1)}
                    className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 text-slate-300 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-mono text-slate-400">Page {payoutsPage}</span>
                  <button
                    disabled={payoutsPage * 15 >= payoutsTotal}
                    onClick={() => setPayoutsPage((p) => p + 1)}
                    className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 text-slate-300 cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5 font-semibold">Tx ID</th>
                  <th className="p-3.5 font-semibold">Cycle</th>
                  <th className="p-3.5 font-semibold">Rank</th>
                  <th className="p-3.5 font-semibold">Masked MSISDN</th>
                  <th className="p-3.5 font-semibold">Amount</th>
                  <th className="p-3.5 font-semibold">Status</th>
                  <th className="p-3.5 font-semibold">Disbursed At</th>
                  <th className="p-3.5 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-500">
                      No payout records found.
                    </td>
                  </tr>
                ) : (
                  payouts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-mono text-slate-400 text-[10px]">{p.transaction_id || p.id?.slice(0, 16)}</td>
                      <td className="p-3.5 font-mono text-slate-300">{p.competition_id}</td>
                      <td className="p-3.5 font-bold text-amber-400">#{p.rank}</td>
                      <td className="p-3.5 font-mono text-white">{p.masked_msisdn}</td>
                      <td className="p-3.5 font-bold text-emerald-400">{Number(p.amount_etb).toLocaleString()} ETB</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          p.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' :
                          p.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-rose-500/10 text-rose-400'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 font-mono text-[10px]">
                        {p.disbursed_at ? new Date(p.disbursed_at).toLocaleString() : 'Pending'}
                      </td>
                      <td className="p-3.5">
                        {p.status !== 'SUCCESS' && (
                          <button
                            onClick={() => handleRetryPayout(p.id)}
                            className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[10px] cursor-pointer"
                          >
                            Retry
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── UNMASK PII MODAL (ROLE 5 MANDATE) ──────────────────────────────── */}
        {unmaskTarget && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Eye className="text-amber-400" size={16} /> Operator PII Unmasking Verification
                </h3>
                <button
                  onClick={() => setUnmaskTarget(null)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  &times;
                </button>
              </div>

              <p className="text-xs text-slate-400">
                Ethio Telecom regulatory compliance requires mandatory audit logging whenever customer MSISDNs are unmasked.
              </p>

              {unmaskedResult ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 text-center space-y-1">
                  <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Unmasked Phone Number:</span>
                  <span className="text-xl font-mono font-black text-emerald-400 tracking-wider block">
                    {unmaskedResult}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-2">Audit entry recorded in database.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Operational Justification
                    </label>
                    <input
                      type="text"
                      value={unmaskJustification}
                      onChange={(e) => setUnmaskJustification(e.target.value)}
                      placeholder="e.g. Prize disbursement identity verification"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <button
                    disabled={unmasking}
                    onClick={handleUnmaskMsisdn}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                  >
                    {unmasking ? 'Authorizing & Logging...' : 'Confirm Unmask & Log to Audit Trail'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
