import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import { CommandCenter } from '../components/CommandCenter.jsx';
import { MapTracker } from '../components/MapTracker.jsx';
import { HospitalList } from '../components/HospitalList.jsx';
import { PatientSearch } from '../components/PatientSearch.jsx';
import { AlertCircle, RefreshCw, Layers } from 'lucide-react';

export const Dashboard = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const [hRes, aRes, eRes] = await Promise.all([
        api.hospitals.getAll(),
        api.ambulances.getAll(),
        api.emergencies.getAll()
      ]);

      if (hRes.success) setHospitals(hRes.data);
      if (aRes.success) setAmbulances(aRes.data);
      if (eRes.success) {
        setEmergencies(eRes.data);
        
        // Keep the selected case reference updated with new API state
        if (selectedCase) {
          const updated = eRes.data.find(e => e._id === selectedCase._id);
          if (updated) setSelectedCase(updated);
        }
      }
      setError('');
    } catch (err) {
      console.error(err);
      setError('Operational Link Down. Check backend server connection.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
    // Poll updates every 3 seconds for simulated GPS updates
    const timer = setInterval(() => loadData(false), 3000);
    return () => clearInterval(timer);
  }, [selectedCase?._id]);

  const handleDispatch = async (emergencyId) => {
    try {
      const res = await api.emergencies.dispatch(emergencyId);
      if (res.success) {
        await loadData(false);
        // Select this emergency immediately to trigger path animation
        setSelectedCase(res.data.emergency);
      }
    } catch (err) {
      setError(err.message || 'Dispatch failure.');
    }
  };

  const handleResolve = async (id) => {
    try {
      const res = await api.emergencies.resolve(id);
      if (res.success) {
        if (selectedCase && selectedCase._id === id) {
          setSelectedCase(null);
        }
        await loadData(false);
      }
    } catch (err) {
      setError(err.message || 'Resolve operation failed.');
    }
  };

  return (
    <main className="p-6 space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center justify-between text-sm font-mono animate-bounce">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={() => loadData(true)} 
            className="bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 px-3 py-1 rounded-lg text-xs font-bold uppercase transition"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Main Grid Layout */}
      {loading ? (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400 font-mono">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Syncing Operations Grid...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Col 1 & 2: Map and Priorities */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Tracker Map */}
            <div className="h-[450px]">
              <MapTracker 
                hospitals={hospitals} 
                ambulances={ambulances} 
                emergencies={emergencies}
                selectedCase={selectedCase}
                onRefresh={() => loadData(false)}
              />
            </div>

            {/* CommandCenter (Queues & Active Ops) */}
            <CommandCenter 
              emergencies={emergencies} 
              onDispatch={handleDispatch}
              onResolve={handleResolve}
              onSelectCase={setSelectedCase}
              selectedCaseId={selectedCase?._id}
            />
          </div>

          {/* Col 3: Sidebar lookup and status */}
          <div className="space-y-6">
            {/* Selected case detail banner */}
            {selectedCase && (
              <div className="glass-panel border-blue-500/30 bg-blue-600/5 rounded-xl p-4 font-mono text-xs text-blue-300 flex items-start gap-3 animate-fadeIn">
                <Layers className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold uppercase tracking-wider text-blue-400">Inspecting Route</div>
                  <div className="mt-1 font-bold text-slate-100">{selectedCase.patientName}</div>
                  <div className="mt-0.5">Problem: {selectedCase.problem}</div>
                  <div className="mt-0.5">Severity: {selectedCase.severity}</div>
                  <div className="mt-0.5">Status: <span className="text-rose-400">{selectedCase.status}</span></div>
                </div>
                <button 
                  onClick={() => setSelectedCase(null)} 
                  className="text-slate-500 hover:text-slate-300 font-bold px-2 py-0.5 border border-slate-800 rounded bg-slate-950"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Patient HashMap Lookup */}
            <PatientSearch />

            {/* Hospitals status board */}
            <HospitalList 
              hospitals={hospitals} 
              highlightedHospitalId={selectedCase?.assignedHospital?._id || selectedCase?.assignedHospital}
            />
          </div>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
