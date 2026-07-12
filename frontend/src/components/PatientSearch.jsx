import React, { useState } from 'react';
import { api } from '../utils/api.js';
import { Search, UserCheck, AlertTriangle, AlertCircle, Heart } from 'lucide-react';

export const PatientSearch = () => {
  const [patientId, setPatientId] = useState('');
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!patientId.trim()) return;

    setLoading(true);
    setError('');
    setPatient(null);

    try {
      const response = await api.patients.getHistory(patientId);
      if (response.success) {
        setPatient(response.data);
      } else {
        setError('Patient not found');
      }
    } catch (err) {
      setError(err.message || 'No patient matches this ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="h-5 w-5 text-emerald-400" />
        <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">Patient History O(1) Lookup</h2>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Enter Patient ID (e.g. 123, 456, 789)..."
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full bg-[#0a0f1d] text-slate-200 placeholder-slate-500 text-sm border border-slate-800 focus:border-emerald-500/50 rounded-lg pl-3 pr-10 py-2.5 outline-none transition-all duration-300 font-mono"
          />
          <button 
            type="submit"
            className="absolute right-2.5 top-2.5 text-slate-500 hover:text-emerald-400 transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>

      {loading && (
        <div className="py-8 flex items-center justify-center gap-2 text-slate-400 text-sm font-mono">
          <div className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          Hashing index keys...
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg p-3.5 flex items-start gap-2.5 text-xs font-mono">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Lookup Error:</span> {error}
          </div>
        </div>
      )}

      {patient && (
        <div className="bg-[#0c1322]/80 border border-emerald-500/15 rounded-lg p-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-bold text-slate-200">{patient.name}</span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
              ID: {patient.patientId}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
            <div className="bg-slate-900/40 p-2 rounded">
              <div className="text-slate-500 text-[10px] uppercase">Age / Gender</div>
              <div className="text-slate-300 font-bold">{patient.age}y / {patient.gender}</div>
            </div>
            <div className="bg-slate-900/40 p-2 rounded">
              <div className="text-slate-500 text-[10px] uppercase">Blood Group</div>
              <div className="text-emerald-400 font-bold">{patient.bloodGroup}</div>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Allergies:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {patient.allergies?.length > 0 && patient.allergies[0] !== 'None' ? (
                  patient.allergies.map((allergy, i) => (
                    <span key={i} className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] px-2 py-0.5 rounded">
                      {allergy}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">No recorded allergies</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Chronic Conditions:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {patient.medicalConditions?.length > 0 && patient.medicalConditions[0] !== 'None' ? (
                  patient.medicalConditions.map((cond, i) => (
                    <span key={i} className="bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] px-2 py-0.5 rounded">
                      {cond}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">No history recorded</span>
                )}
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-2.5 mt-2.5 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Emergency Contact:</span>
              <span className="text-slate-300 font-bold">{patient.contact}</span>
            </div>
          </div>
        </div>
      )}

      {!patient && !loading && !error && (
        <div className="text-center py-6 text-slate-500 text-xs italic font-mono">
          Enter a patient ID to retrieve their verified clinical profile.
        </div>
      )}
    </div>
  );
};

export default PatientSearch;
