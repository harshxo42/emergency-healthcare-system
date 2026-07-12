import React from 'react';
import { ShieldAlert, Ambulance, CheckCircle, Clock, Trash2, ArrowRight, User } from 'lucide-react';

export const CommandCenter = ({ 
  emergencies = [], 
  onDispatch = null, 
  onResolve = null, 
  onSelectCase = null,
  selectedCaseId = null
}) => {
  const pendingCases = emergencies.filter(e => e.status === 'Pending');
  const activeCases = emergencies.filter(e => e.status === 'Dispatched' || e.status === 'EnRoute' || e.status === 'Arrived');

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
        );
      case 'high':
        return <span className="h-2 w-2 rounded-full bg-amber-500" />;
      case 'normal':
      default:
        return <span className="h-2 w-2 rounded-full bg-blue-500" />;
    }
  };

  const getSeverityTextClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'text-rose-400 font-bold';
      case 'high':
        return 'text-amber-400 font-bold';
      case 'normal':
      default:
        return 'text-blue-400';
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      {/* Pending Priority Queue */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800 flex flex-col">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">Pending Priority Queue</h2>
          </div>
          <span className="text-xs font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full">
            {pendingCases.length} Cases Waiting
          </span>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1 flex-1">
          {pendingCases.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm font-mono italic">
              🚫 No pending emergency signals in queue.
            </div>
          ) : (
            pendingCases.map((e, index) => {
              const isSelected = selectedCaseId && e._id === selectedCaseId;
              return (
                <div 
                  key={e._id} 
                  onClick={() => onSelectCase && onSelectCase(e)}
                  className={`border rounded-xl p-3.5 cursor-pointer transition-all duration-300 ${
                    isSelected 
                      ? 'bg-rose-500/5 border-rose-500/50 shadow-md shadow-rose-950/20' 
                      : 'bg-[#0a0f1d]/50 border-slate-800/80 hover:border-slate-700/85'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-mono font-bold bg-slate-900 border border-slate-800 text-slate-400 h-6 w-6 rounded-full flex items-center justify-center">
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">{e.patientName}</h4>
                        <p className="text-[10px] text-slate-500 font-mono">Patient ID: {e.patientId}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-lg">
                      {getSeverityBadge(e.severity)}
                      <span className={`text-[10px] font-mono uppercase tracking-wider ${getSeverityTextClass(e.severity)}`}>
                        {e.severity}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono my-2.5 bg-slate-900/30 p-2 rounded-lg">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Problem</span>
                      <span className="text-slate-300 font-medium line-clamp-1">{e.problem}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Location</span>
                      <span className="text-slate-300 font-medium line-clamp-1">{e.locationName} [{e.location?.x}, {e.location?.y}]</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/50 pt-2.5 mt-2.5">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(e.createdAt).toLocaleTimeString()}</span>
                    </div>

                    <button
                      onClick={(evt) => {
                        evt.stopPropagation();
                        onDispatch && onDispatch(e._id);
                      }}
                      className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg flex items-center gap-1 shadow-md shadow-rose-950/20 active:scale-95 transition-all"
                    >
                      Dispatch SOS <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Dispatched / Active Operations */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800 flex flex-col">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Ambulance className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">Active Operations</h2>
          </div>
          <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            {activeCases.length} Enroute / Dispatched
          </span>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1 flex-1">
          {activeCases.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm font-mono italic">
              🚑 No vehicles currently dispatched on routes.
            </div>
          ) : (
            activeCases.map((e) => {
              const isSelected = selectedCaseId && e._id === selectedCaseId;
              const ambNum = e.assignedAmbulance?.vehicleNumber || 'AMB-???';
              const hospName = e.assignedHospital?.name || 'Hospital Reserved';

              return (
                <div 
                  key={e._id}
                  onClick={() => onSelectCase && onSelectCase(e)}
                  className={`border rounded-xl p-3.5 cursor-pointer transition-all duration-300 ${
                    isSelected 
                      ? 'bg-emerald-500/5 border-emerald-500/50 shadow-md shadow-emerald-950/20' 
                      : 'bg-[#0a0f1d]/50 border-slate-800/80 hover:border-slate-700/85'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{e.patientName}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">Problem: {e.problem}</p>
                    </div>

                    <span className="text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md uppercase animate-pulse">
                      Dispatched
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono my-2.5 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Vehicle Assigned</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Ambulance className="h-3 w-3" /> {ambNum}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Destination ICU</span>
                      <span className="text-blue-400 font-bold flex items-center gap-1 line-clamp-1">
                        🏢 {hospName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/50 pt-2.5 mt-2.5">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Location: {e.locationName}
                    </span>

                    <button
                      onClick={(evt) => {
                        evt.stopPropagation();
                        onResolve && onResolve(e._id);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg flex items-center gap-1 shadow-md shadow-emerald-950/20 active:scale-95 transition-all"
                    >
                      Resolve Case <CheckCircle className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
