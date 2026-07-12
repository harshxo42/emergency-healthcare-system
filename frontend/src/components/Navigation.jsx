import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, ShieldAlert, Users, LayoutDashboard } from 'lucide-react';

export const Navigation = () => {
  const location = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="border-b border-blue-950 bg-[#060b13]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Activity className="h-8 w-8 text-rose-500 animate-heartbeat" />
          <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rose-500 animate-ping" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wider text-slate-100 flex items-center gap-2">
            AURA-EMS <span className="text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-mono">COMMAND CENTER</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Emergency Response Dispatch System</p>
        </div>
      </div>

      <nav className="flex items-center gap-2 font-medium">
        <Link 
          to="/" 
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
            isActive('/') 
              ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/55'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
        <Link 
          to="/dispatch" 
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
            isActive('/dispatch') 
              ? 'bg-rose-600/10 text-rose-400 border border-rose-500/20' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/55'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          Dispatch SOS
        </Link>
        <Link 
          to="/patients" 
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
            isActive('/patients') 
              ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/55'
          }`}
        >
          <Users className="h-4 w-4" />
          Patient Registry
        </Link>
      </nav>

      <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
          <div className="text-sm font-mono font-bold text-blue-400 tracking-wider">
            {time.toLocaleTimeString()}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">System Live</span>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
