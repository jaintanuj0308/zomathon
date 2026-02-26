import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Store, 
  Settings, 
  ChevronRight, 
  Clock, 
  Users, 
  AlertCircle,
  TrendingDown,
  Wifi,
  Monitor,
  Database as DbIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

// --- Types ---
type View = 'dashboard' | 'simulation' | 'merchant' | 'settings';

interface Stats {
  avgRiderWait: number;
  etaErrorP90: number;
  orderVolume: number;
  activeMerchants: number;
  improvement: number;
  liveRush: {
    index: number;
    status: string;
    sources: { name: string; volume: number; weight: number }[];
  };
}

// --- Components ---

const LiveRushIndicator = ({ data }: { data: Stats['liveRush'] }) => (
  <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg font-bold text-zinc-900">Restaurant Live Rush</h2>
      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
        data.index > 70 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
      }`}>
        {data.status} Load
      </div>
    </div>

    <div className="flex items-center gap-8 mb-8">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="58"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-zinc-100"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="58"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={364.4}
            initial={{ strokeDashoffset: 364.4 }}
            animate={{ strokeDashoffset: 364.4 - (364.4 * data.index) / 100 }}
            className={data.index > 70 ? 'text-rose-500' : 'text-emerald-500'}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-zinc-900">{data.index}</span>
          <span className="text-[10px] font-bold text-zinc-400 uppercase">Index</span>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {data.sources.map((source, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
              <span className="text-zinc-500">{source.name}</span>
              <span className="text-zinc-900">{source.volume}%</span>
            </div>
            <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${source.volume}%` }}
                className={`h-full ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-blue-500' : 'bg-amber-500'}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
      <p className="text-xs text-zinc-500 leading-relaxed">
        <span className="font-bold text-zinc-900">Model Impact:</span> This aggregated signal is currently contributing <span className="font-bold text-zinc-900">42%</span> to the final KPT prediction, overriding merchant-marked signals during peak hours.
      </p>
    </div>
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-emerald-50 text-emerald-700 font-medium shadow-sm' 
        : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
    }`}
  >
    <Icon size={20} />
    <span className="text-sm">{label}</span>
    {active && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
  </button>
);

const StatCard = ({ label, value, subValue, icon: Icon, trend }: { label: string, value: string, subValue?: string, icon: any, trend?: 'up' | 'down' }) => (
  <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-zinc-50 rounded-lg text-zinc-600">
        <Icon size={20} />
      </div>
      {trend && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          trend === 'down' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {trend === 'down' ? '-12%' : '+8%'}
        </span>
      )}
    </div>
    <h3 className="text-zinc-500 text-sm font-medium mb-1">{label}</h3>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-zinc-900">{value}</span>
      {subValue && <span className="text-zinc-400 text-sm">{subValue}</span>}
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch stats", err);
        // Fallback for demo
        setStats({
          avgRiderWait: 4.2,
          etaErrorP90: 8.5,
          orderVolume: 1250,
          activeMerchants: 320,
          improvement: 18.5
        });
        setLoading(false);
      });
  }, []);

  const renderDashboard = () => (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Kitchen Intelligence</h1>
          <p className="text-zinc-500 mt-1 font-medium italic serif">Optimizing KPT through signal enrichment</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE SYSTEM
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Avg. Rider Wait" 
          value={`${stats?.avgRiderWait}m`} 
          icon={Clock} 
          trend="down"
        />
        <StatCard 
          label="ETA Error (P90)" 
          value={`${stats?.etaErrorP90}m`} 
          icon={AlertCircle} 
          trend="down"
        />
        <StatCard 
          label="Order Volume" 
          value={stats?.orderVolume.toLocaleString() || '0'} 
          icon={Activity} 
        />
        <StatCard 
          label="System Improvement" 
          value={`+${stats?.improvement}%`} 
          subValue="vs Baseline"
          icon={TrendingDown} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-zinc-900">KPT Accuracy Trend</h2>
              <select className="text-sm border-none bg-zinc-50 rounded-lg px-3 py-1.5 focus:ring-0">
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
              </select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { time: '08:00', baseline: 12, enriched: 10 },
                  { time: '10:00', baseline: 15, enriched: 11 },
                  { time: '12:00', baseline: 22, enriched: 16 },
                  { time: '14:00', baseline: 18, enriched: 14 },
                  { time: '16:00', baseline: 14, enriched: 12 },
                  { time: '18:00', baseline: 25, enriched: 18 },
                  { time: '20:00', baseline: 20, enriched: 15 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="baseline" stroke="#e4e4e7" strokeWidth={2} dot={false} name="Manual FOR (Baseline)" />
                  <Line type="monotone" dataKey="enriched" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} name="KIS Enriched" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {stats?.liveRush && <LiveRushIndicator data={stats.liveRush} />}
        </div>

        <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-xl h-fit">
          <h2 className="text-lg font-bold mb-6">Signal Health</h2>
          <div className="space-y-6">
            {[
              { name: 'WiFi Proximity', status: 'Optimal', icon: Wifi, color: 'text-emerald-400', desc: 'Auto-detects rider arrival to de-noise FOR bias.' },
              { name: 'POS Integration', status: 'Active', icon: DbIcon, color: 'text-emerald-400', desc: 'Syncs total kitchen load (In-store + Competitors).' },
              { name: 'Kitchen Display', status: 'Warning', icon: Monitor, color: 'text-amber-400', desc: 'Tracks real-time prep stages (Started/Plating).' },
              { name: 'Rider App Sync', status: 'Optimal', icon: Users, color: 'text-emerald-400', desc: 'Validates merchant markings against rider GPS.' },
            ].map((signal, i) => (
              <div key={i} className="group relative p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-help">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <signal.icon size={18} className={signal.color} />
                    <span className="text-sm font-medium">{signal.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-white/10 ${signal.color}`}>
                    {signal.status}
                  </span>
                </div>
                <p className="mt-2 text-[10px] text-zinc-500 leading-tight opacity-0 group-hover:opacity-100 transition-opacity">
                  {signal.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-xs text-emerald-100 leading-relaxed">
              <span className="font-bold">Intelligence:</span> When WiFi detects a rider within 50m *before* FOR is marked, the system applies a <span className="text-emerald-400 font-bold">1.2x bias correction</span> to the KPT model.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSimulation = () => (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Real-time Simulation</h1>
        <p className="text-zinc-500 mt-1">Visualizing order flow and signal de-noising logic</p>
      </header>

      <div className="bg-white border border-zinc-100 rounded-2xl p-8 min-h-[500px] relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
          {['Incoming', 'Preparing', 'Ready (FOR)', 'Picked Up'].map((stage, i) => (
            <div key={i} className="flex flex-col">
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4 px-2">
                {stage}
              </div>
              <div className="flex-1 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200 p-4 space-y-4">
                {/* Simulated Orders */}
                {i === 1 && (
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-white p-4 rounded-xl shadow-sm border border-zinc-100"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-zinc-900">#ORD-8821</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">Zomato</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ width: '65%' }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="bg-emerald-500 h-full" 
                      />
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-400">
                      <Monitor size={12} />
                      <span>KDS: Plating Stage</span>
                    </div>
                  </motion.div>
                )}
                {i === 2 && (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-amber-900">#ORD-8819</span>
                      <AlertCircle size={14} className="text-amber-500" />
                    </div>
                    <p className="text-[10px] text-amber-700 leading-tight mb-3">
                      Manual FOR marked. <br/>
                      <span className="font-bold">Bias Detected:</span> Rider within 50m.
                    </p>
                    <div className="flex gap-1">
                      <div className="flex-1 h-1 bg-amber-200 rounded-full" />
                      <div className="flex-1 h-1 bg-amber-200 rounded-full" />
                      <div className="flex-1 h-1 bg-zinc-200 rounded-full" />
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[10px] text-amber-600">
                      <Wifi size={12} />
                      <span>WiFi: Rider Proximity High</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Legend / Controls */}
        <div className="mt-8 md:absolute md:bottom-8 md:right-8 bg-zinc-900 text-white p-6 rounded-2xl shadow-2xl max-w-xs">
          <h3 className="text-sm font-bold mb-4">Signal Intelligence</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
              <div>
                <p className="text-xs font-medium">Auto-Validation</p>
                <p className="text-[10px] text-zinc-400">Comparing manual FOR against WiFi rider proximity to filter bias.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
              <div>
                <p className="text-xs font-medium">Total Load Sync</p>
                <p className="text-[10px] text-zinc-400">POS integration injecting in-store dining volume into KPT model.</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-6 py-2 bg-white text-zinc-900 rounded-lg text-xs font-bold hover:bg-zinc-100 transition-colors">
            Run Stress Test
          </button>
        </div>
      </div>
    </div>
  );

  const renderMerchant = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Merchant Experience (Mx)</h1>
        <p className="text-zinc-500 mt-1">Simulated interface for the improved merchant workflow</p>
      </header>

      <div className="bg-[#F4F4F4] rounded-[40px] p-8 border-[12px] border-zinc-900 shadow-2xl aspect-[9/16] max-w-[360px] mx-auto relative overflow-hidden">
        {/* Phone UI */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-xs font-bold">9:41</div>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-zinc-300" />
            <div className="w-3 h-3 rounded-full bg-zinc-300" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Store size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold">The Burger Joint</h3>
                <p className="text-[10px] text-zinc-400">Active • 12 Orders</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 flex flex-col items-center gap-1">
                <Activity size={16} className="text-zinc-400" />
                <span className="text-[10px] font-bold">Insights</span>
              </button>
              <button className="p-3 bg-rose-50 rounded-xl border border-rose-100 flex flex-col items-center gap-1 text-rose-600">
                <AlertCircle size={16} />
                <span className="text-[10px] font-bold">Rush Mode</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">Active Orders</h4>
            {[
              { id: '8821', time: '12m', status: 'Preparing' },
              { id: '8825', time: '5m', status: 'New' },
            ].map((order, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold">#ORD-{order.id}</p>
                  <p className="text-[10px] text-zinc-400">{order.time} elapsed</p>
                </div>
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-bold">
                  Mark Ready
                </button>
              </div>
            ))}
          </div>

          <div className="bg-zinc-900 text-white p-4 rounded-2xl mt-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={14} className="text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Prep Accuracy</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Your prep timing is <span className="text-white font-bold">92% accurate</span> today. Keep it up to boost your visibility!
            </p>
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-white border-t border-zinc-100 flex items-center justify-around px-4">
          <LayoutDashboard size={20} className="text-emerald-600" />
          <Activity size={20} className="text-zinc-300" />
          <Users size={20} className="text-zinc-300" />
          <Settings size={20} className="text-zinc-300" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-100 bg-white p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">Z</div>
          <span className="font-bold tracking-tight text-lg">Kitchen Intel</span>
        </div>

        <nav className="space-y-2 flex-1">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeView === 'dashboard'} 
            onClick={() => setActiveView('dashboard')} 
          />
          <SidebarItem 
            icon={Activity} 
            label="Live Simulation" 
            active={activeView === 'simulation'} 
            onClick={() => setActiveView('simulation')} 
          />
          <SidebarItem 
            icon={Store} 
            label="Merchant Portal" 
            active={activeView === 'merchant'} 
            onClick={() => setActiveView('merchant')} 
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-50 space-y-4 hidden md:block">
          <SidebarItem 
            icon={Settings} 
            label="Settings" 
            active={activeView === 'settings'} 
            onClick={() => setActiveView('settings')} 
          />
          <div className="bg-zinc-50 p-4 rounded-xl">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-2">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-zinc-600">All signals active</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeView === 'dashboard' && renderDashboard()}
            {activeView === 'simulation' && renderSimulation()}
            {activeView === 'merchant' && renderMerchant()}
            {activeView === 'settings' && (
              <div className="max-w-2xl">
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-8">System Configuration</h1>
                <div className="space-y-6">
                  <div className="p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                    <h3 className="font-bold mb-4">Signal Weights</h3>
                    <div className="space-y-4">
                      {['Manual FOR', 'WiFi Proximity', 'POS Load Sync', 'KDS Progress'].map((signal, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-zinc-600">{signal}</span>
                          <input type="range" className="w-32 accent-emerald-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
