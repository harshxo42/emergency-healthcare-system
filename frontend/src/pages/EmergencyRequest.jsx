import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api.js';
import { ShieldAlert, MapPin, User, AlertTriangle } from 'lucide-react';

export const EmergencyRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patient: '123',
    locationName: 'Noida Sector 62',
    x: 50,
    y: 50,
    problem: 'Road accident, head injury',
    severity: 'Critical'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSliderChange = (name, val) => {
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(val)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      patient: formData.patient,
      locationName: formData.locationName,
      location: {
        x: formData.x,
        y: formData.y
      },
      problem: formData.problem,
      severity: formData.severity
    };

    try {
      const res = await api.emergencies.create(payload);
      if (res.success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Failed to file emergency SOS request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <div className="glass-panel border-rose-500/25 bg-rose-600/5 rounded-2xl p-6 border shadow-xl shadow-rose-950/5">
        <div className="flex items-center gap-3 mb-5 border-b border-slate-800 pb-4">
          <ShieldAlert className="h-7 w-7 text-rose-500 animate-pulse" />
          <div>
            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider">File SOS Emergency Signal</h2>
            <p className="text-xs text-slate-400 font-mono">Triggers priority queue algorithm on dispatch server</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs font-mono mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="text-slate-400 block mb-1 uppercase font-bold tracking-wider">Patient Identification (ID)</label>
            <div className="relative">
              <input
                type="text"
                name="patient"
                value={formData.patient}
                onChange={handleChange}
                required
                className="w-full bg-[#0a0f1d] text-slate-200 border border-slate-800 focus:border-rose-500/50 rounded-lg pl-9 pr-3 py-2.5 outline-none font-bold"
                placeholder="Enter Patient ID (e.g. 123, 456)..."
              />
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Used by HashMap O(1) index to load chronic conditions instantly.</span>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 uppercase font-bold tracking-wider">Emergency Severity Class</label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="w-full bg-[#0a0f1d] text-slate-200 border border-slate-800 focus:border-rose-500/50 rounded-lg px-3 py-2.5 outline-none font-bold"
            >
              <option value="Critical">🔴 CRITICAL (Cardiac arrest, severe accidents, trauma)</option>
              <option value="High">🟠 HIGH (Fractures, bleeding, high fever, breathing pain)</option>
              <option value="Normal">🔵 NORMAL (Minor cuts, sprains, stable symptoms)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 uppercase font-bold tracking-wider">Emergency Location Name</label>
            <div className="relative">
              <input
                type="text"
                name="locationName"
                value={formData.locationName}
                onChange={handleChange}
                required
                className="w-full bg-[#0a0f1d] text-slate-200 border border-slate-800 focus:border-rose-500/50 rounded-lg pl-9 pr-3 py-2.5 outline-none"
                placeholder="E.g. Sector 62, Noida"
              />
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* Coordinate Sliders */}
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 space-y-4">
            <h4 className="font-bold uppercase tracking-wider text-slate-400 border-b border-slate-900 pb-1.5 mb-2 flex items-center justify-between">
              <span>Operations Coordinate Grid Location</span>
              <span className="text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded text-[10px]">
                X: {formData.x} | Y: {formData.y}
              </span>
            </h4>

            <div>
              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                <span>GRID X (WEST - EAST)</span>
                <span>{formData.x}</span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                value={formData.x}
                onChange={(e) => handleSliderChange('x', e.target.value)}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                <span>GRID Y (NORTH - SOUTH)</span>
                <span>{formData.y}</span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                value={formData.y}
                onChange={(e) => handleSliderChange('y', e.target.value)}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 uppercase font-bold tracking-wider">Reported Symptoms / Problems</label>
            <textarea
              name="problem"
              value={formData.problem}
              onChange={handleChange}
              required
              rows="3"
              className="w-full bg-[#0a0f1d] text-slate-200 border border-slate-800 focus:border-rose-500/50 rounded-lg px-3 py-2.5 outline-none resize-none"
              placeholder="Describe symptoms, accident details..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold uppercase tracking-wider py-3 rounded-lg shadow-lg shadow-rose-950/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Registering SOS Signal...
              </>
            ) : (
              'File SOS Signal (Priority Queue)'
            )}
          </button>
        </form>
      </div>
    </main>
  );
};

export default EmergencyRequest;
