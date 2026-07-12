import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import { Users, UserPlus, Phone, Heart, Activity, AlertTriangle } from 'lucide-react';

export const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    patientId: '',
    name: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'O+',
    allergies: '',
    medicalConditions: '',
    contact: ''
  });
  const [formSuccess, setFormSuccess] = useState('');

  const loadPatients = async () => {
    try {
      const res = await api.patients.getAll();
      if (res.success) {
        setPatients(res.data);
      }
    } catch (err) {
      setError('Failed to fetch patient registry records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFormSuccess('');

    const payload = {
      ...formData,
      age: parseInt(formData.age),
      allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()) : [],
      medicalConditions: formData.medicalConditions ? formData.medicalConditions.split(',').map(s => s.trim()) : []
    };

    try {
      const res = await api.patients.create(payload);
      if (res.success) {
        setFormSuccess(`Patient record for ${res.data.name} registered and cached successfully.`);
        setFormData({
          patientId: '',
          name: '',
          age: '',
          gender: 'Male',
          bloodGroup: 'O+',
          allergies: '',
          medicalConditions: '',
          contact: ''
        });
        loadPatients();
      }
    } catch (err) {
      setError(err.message || 'Error registering patient.');
    }
  };

  return (
    <main className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Register Form */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 h-fit">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <UserPlus className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">Register New Patient</h2>
          </div>

          {formSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-xs font-mono mb-4">
              {formSuccess}
            </div>
          )}

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs font-mono mb-4 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1 uppercase font-bold tracking-wider">Patient ID (Unique Identifier)</label>
              <input
                type="text"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                required
                className="w-full bg-[#0a0f1d] text-slate-200 border border-slate-800 focus:border-emerald-500/50 rounded-lg px-3 py-2 outline-none font-bold"
                placeholder="E.g. 101, 102, or SSN"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 uppercase font-bold tracking-wider">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-[#0a0f1d] text-slate-200 border border-slate-800 focus:border-emerald-500/50 rounded-lg px-3 py-2 outline-none"
                placeholder="E.g. Vikramaditya Sen"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 uppercase font-bold tracking-wider">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0a0f1d] text-slate-200 border border-slate-800 focus:border-emerald-500/50 rounded-lg px-3 py-2 outline-none"
                  placeholder="Age"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 uppercase font-bold tracking-wider">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-[#0a0f1d] text-slate-200 border border-slate-800 focus:border-emerald-500/50 rounded-lg px-3 py-2 outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 uppercase font-bold tracking-wider">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full bg-[#0a0f1d] text-slate-200 border border-slate-800 focus:border-emerald-500/50 rounded-lg px-3 py-2 outline-none"
              >
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 uppercase font-bold tracking-wider">Allergies (comma-separated)</label>
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                className="w-full bg-[#0a0f1d] text-slate-200 border border-slate-800 focus:border-emerald-500/50 rounded-lg px-3 py-2 outline-none"
                placeholder="E.g. Penicillin, Peanuts"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 uppercase font-bold tracking-wider">Medical Conditions (comma-separated)</label>
              <input
                type="text"
                name="medicalConditions"
                value={formData.medicalConditions}
                onChange={handleChange}
                className="w-full bg-[#0a0f1d] text-slate-200 border border-slate-800 focus:border-emerald-500/50 rounded-lg px-3 py-2 outline-none"
                placeholder="E.g. Asthma, Hypertension"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 uppercase font-bold tracking-wider">Emergency Contact Phone</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                className="w-full bg-[#0a0f1d] text-slate-200 border border-slate-800 focus:border-emerald-500/50 rounded-lg px-3 py-2 outline-none"
                placeholder="E.g. +91 9999988888"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold uppercase tracking-wider py-2.5 rounded-lg active:scale-[0.99] transition-all shadow-md shadow-emerald-950/20"
            >
              Add to Registry Cache
            </button>
          </form>
        </div>

        {/* Registered Patients Database List */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 lg:col-span-2 flex flex-col h-[580px]">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-400" />
              <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">Operational Patient Registry</h2>
            </div>
            <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
              {patients.length} Indexed
            </span>
          </div>

          <div className="overflow-y-auto pr-1 flex-1 space-y-3">
            {loading ? (
              <div className="text-center py-20 text-slate-500 text-sm font-mono">
                Loading index data...
              </div>
            ) : patients.length === 0 ? (
              <div className="text-center py-20 text-slate-500 text-sm font-mono italic">
                No patient data indexed. Fill the registration form to add patient files.
              </div>
            ) : (
              patients.map(p => (
                <div key={p._id} className="bg-[#0a0f1d]/50 border border-slate-850 hover:border-slate-700/80 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4 transition-all duration-300">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-200">{p.name}</span>
                      <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                        ID: {p.patientId}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-slate-400">
                      <span>Age: <strong className="text-slate-300">{p.age}</strong></span>
                      <span>Gender: <strong className="text-slate-300">{p.gender}</strong></span>
                      <span className="text-emerald-400 font-bold">Blood Type: {p.bloodGroup}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {p.allergies?.map((a, i) => (
                        <span key={i} className="text-[9px] font-mono bg-rose-500/10 border border-rose-500/10 text-rose-400 px-1.5 py-0.2 rounded">
                          Allergy: {a}
                        </span>
                      ))}
                      {p.medicalConditions?.map((c, i) => (
                        <span key={i} className="text-[9px] font-mono bg-amber-500/10 border border-amber-500/10 text-amber-400 px-1.5 py-0.2 rounded">
                          Condition: {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-3 sm:pt-0 sm:pl-4 flex-shrink-0">
                    <div className="text-[10px] text-slate-500 font-mono">EMERGENCY CONTACT</div>
                    <div className="flex items-center gap-1 font-mono text-xs text-slate-300 font-bold">
                      <Phone className="h-3 w-3 text-emerald-400" />
                      <span>{p.contact}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default PatientsList;
