import React, { useEffect, useState } from 'react';
import { api } from '../utils/api.js';
import { Navigation2, Building2, User } from 'lucide-react';

export const MapTracker = ({ 
  hospitals = [], 
  ambulances = [], 
  emergencies = [], 
  selectedCase = null,
  onRefresh = null
}) => {
  const [animatingAmbulanceId, setAnimatingAmbulanceId] = useState(null);
  const [simulationCoords, setSimulationCoords] = useState(null);
  const [simulationStatus, setSimulationStatus] = useState('');

  // Run routing simulation if a case is selected and has an assigned ambulance/hospital
  useEffect(() => {
    if (!selectedCase || selectedCase.status !== 'Dispatched') {
      setAnimatingAmbulanceId(null);
      setSimulationCoords(null);
      setSimulationStatus('');
      return;
    }

    const ambulance = selectedCase.assignedAmbulance;
    const hospital = selectedCase.assignedHospital;

    if (!ambulance || !hospital) return;

    // Find the current live ambulance coordinates
    const liveAmb = ambulances.find(a => a._id === (ambulance._id || ambulance));
    if (!liveAmb) return;

    setAnimatingAmbulanceId(liveAmb._id);
    
    // We will animate the route: Start -> Patient -> Hospital
    const startLoc = { ...liveAmb.location };
    const patientLoc = { ...selectedCase.location };
    
    let hospLoc = { x: 50, y: 50 };
    const liveHosp = hospitals.find(h => h._id === (hospital._id || hospital));
    if (liveHosp) hospLoc = { ...liveHosp.location };

    setSimulationCoords({ x: startLoc.x, y: startLoc.y });
    setSimulationStatus('Responding to Patient');

    let currentStep = 0;
    const totalSteps = 40; // speed divider
    let phase = 1; // 1 = to patient, 2 = to hospital

    const interval = setInterval(async () => {
      currentStep++;
      
      let nextX, nextY;
      
      if (phase === 1) {
        // Linear interpolation to patient
        const t = currentStep / totalSteps;
        nextX = startLoc.x + (patientLoc.x - startLoc.x) * t;
        nextY = startLoc.y + (patientLoc.y - startLoc.y) * t;
        
        setSimulationCoords({ x: nextX, y: nextY });

        if (currentStep >= totalSteps) {
          phase = 2;
          currentStep = 0;
          setSimulationStatus('Transporting to ER');
        }
      } else {
        // Linear interpolation to hospital
        const t = currentStep / totalSteps;
        nextX = patientLoc.x + (hospLoc.x - patientLoc.x) * t;
        nextY = patientLoc.y + (hospLoc.y - patientLoc.y) * t;
        
        setSimulationCoords({ x: nextX, y: nextY });

        if (currentStep >= totalSteps) {
          clearInterval(interval);
          setSimulationStatus('Arrived at Hospital');
          
          // Trigger backend update to set ambulance location at hospital and clear emergency
          try {
            await api.ambulances.update(liveAmb._id, {
              x: hospLoc.x,
              y: hospLoc.y,
              status: 'Busy'
            });
            onRefresh && onRefresh();
          } catch (e) {
            console.error('Failed to update final ambulance coordinate:', e);
          }
        }
      }

      // Sync coordinate updates to database periodically (every 5 steps)
      if (currentStep % 5 === 0) {
        try {
          await api.ambulances.update(liveAmb._id, {
            x: parseFloat(nextX.toFixed(2)),
            y: parseFloat(nextY.toFixed(2))
          });
        } catch (err) {
          console.error(err);
        }
      }
    }, 150);

    return () => clearInterval(interval);
  }, [selectedCase, ambulances, hospitals]);

  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-800 flex flex-col h-full min-h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Navigation2 className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">Live Operations Map Tracker</h2>
        </div>
        
        {simulationStatus && (
          <span className="text-[10px] font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
            Status: {simulationStatus}
          </span>
        )}
      </div>

      <div className="relative flex-1 bg-[#040811] rounded-xl overflow-hidden border border-slate-900 grid-bg min-h-[300px]">
        {/* Operations SVG Map grid */}
        <svg viewBox="0 0 100 100" className="w-full h-full text-slate-800">
          {/* Map Grid Roads (Simulated network) */}
          <line x1="20" y1="0" x2="20" y2="100" stroke="rgba(59, 130, 246, 0.08)" strokeWidth="1" />
          <line x1="40" y1="0" x2="40" y2="100" stroke="rgba(59, 130, 246, 0.08)" strokeWidth="1" />
          <line x1="60" y1="0" x2="60" y2="100" stroke="rgba(59, 130, 246, 0.08)" strokeWidth="1" />
          <line x1="80" y1="0" x2="80" y2="100" stroke="rgba(59, 130, 246, 0.08)" strokeWidth="1" />
          <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(59, 130, 246, 0.08)" strokeWidth="1" />
          <line x1="0" y1="40" x2="100" y2="40" stroke="rgba(59, 130, 246, 0.08)" strokeWidth="1" />
          <line x1="0" y1="60" x2="100" y2="60" stroke="rgba(59, 130, 246, 0.08)" strokeWidth="1" />
          <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(59, 130, 246, 0.08)" strokeWidth="1" />

          {/* Active Route Draw */}
          {selectedCase && (selectedCase.status === 'Pending' || selectedCase.status === 'Dispatched') && (
            (() => {
              const ambId = selectedCase.assignedAmbulance?._id || selectedCase.assignedAmbulance;
              const hospId = selectedCase.assignedHospital?._id || selectedCase.assignedHospital;
              
              const amb = ambulances.find(a => a._id === ambId);
              const hosp = hospitals.find(h => h._id === hospId);
              const patient = selectedCase.location;

              if (patient) {
                // If dispatched and animating, draw from active animated ambulance to patient to hospital
                const activeStart = simulationCoords || (amb ? amb.location : null);
                
                return (
                  <>
                    {/* Path to patient */}
                    {activeStart && (
                      <line 
                        x1={activeStart.x} y1={activeStart.y} 
                        x2={patient.x} y2={patient.y} 
                        stroke="#ef4444" strokeWidth="0.8" strokeDasharray="1.5,1" 
                      />
                    )}
                    {/* Path to hospital */}
                    {hosp && (
                      <line 
                        x1={patient.x} y1={patient.y} 
                        x2={hosp.location.x} y2={hosp.location.y} 
                        stroke="#3b82f6" strokeWidth="0.8" strokeDasharray="1.5,1" 
                      />
                    )}
                  </>
                );
              }
              return null;
            })()
          )}

          {/* Render Hospitals */}
          {hospitals.map(h => (
            <g key={h._id}>
              {/* Pulsing ring for destination hospital */}
              {selectedCase?.assignedHospital?._id === h._id && (
                <circle cx={h.location.x} cy={h.location.y} r="4" fill="none" stroke="#3b82f6" strokeWidth="0.3">
                  <animate attributeName="r" values="3;7;3" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              {/* Outer boundary */}
              <circle cx={h.location.x} cy={h.location.y} r="2.2" fill="#0c1322" stroke="#3b82f6" strokeWidth="0.8" />
              {/* Cross symbol */}
              <rect x={h.location.x - 0.3} y={h.location.y - 1} width="0.6" height="2" fill="#3b82f6" />
              <rect x={h.location.x - 1} y={h.location.y - 0.3} width="2" height="0.6" fill="#3b82f6" />
              
              {/* Tooltip labels */}
              <text x={h.location.x} y={h.location.y - 3} textAnchor="middle" fill="#94a3b8" fontSize="2.2" fontFamily="monospace" fontWeight="bold">
                {h.name.split(' ')[0]}
              </text>
            </g>
          ))}

          {/* Render Active Emergencies */}
          {emergencies.filter(e => e.status !== 'Resolved').map(e => (
            <g key={e._id}>
              {/* Red glow pulse */}
              <circle cx={e.location.x} cy={e.location.y} r="3.5" fill="rgba(239, 68, 68, 0.15)">
                <animate attributeName="r" values="2;5;2" dur="1.8s" repeatCount="indefinite" />
              </circle>
              {/* Small solid point */}
              <circle cx={e.location.x} cy={e.location.y} r="1.2" fill="#ef4444" />
              
              <text x={e.location.x} y={e.location.y + 3.2} textAnchor="middle" fill="#ef4444" fontSize="2" fontFamily="monospace" fontWeight="bold">
                SOS
              </text>
            </g>
          ))}

          {/* Render Ambulances */}
          {ambulances.map(a => {
            const isAnimating = a._id === animatingAmbulanceId;
            const currentCoords = isAnimating && simulationCoords ? simulationCoords : a.location;
            
            let color = '#10b981'; // green: available
            if (a.status === 'Dispatched') color = '#ef4444'; // red: busy/dispatched
            if (a.status === 'Busy') color = '#f59e0b'; // amber: transporting/busy

            return (
              <g key={a._id}>
                {/* Active movement highlight */}
                {isAnimating && (
                  <circle cx={currentCoords.x} cy={currentCoords.y} r="3" fill="none" stroke={color} strokeWidth="0.2">
                    <animate attributeName="r" values="2.5;4.5;2.5" dur="1s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Vehicle Marker */}
                <polygon 
                  points={`${currentCoords.x},${currentCoords.y - 1.5} ${currentCoords.x + 1.2},${currentCoords.y + 1.2} ${currentCoords.x - 1.2},${currentCoords.y + 1.2}`}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth="0.3"
                />
                
                <text x={currentCoords.x} y={currentCoords.y - 2.2} textAnchor="middle" fill="#10b981" fontSize="1.8" fontFamily="monospace">
                  {a.vehicleNumber}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 border-t border-slate-900 pt-3.5 flex flex-wrap gap-4 text-xs font-mono justify-center">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 bg-[#0c1322] border border-blue-500 rounded flex items-center justify-center font-bold text-blue-400 text-[8px]">+</div>
          <span className="text-slate-400">ICU Center</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 bg-emerald-500 rounded-sm" />
          <span className="text-slate-400">Amb Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 bg-rose-500 rounded-sm" />
          <span className="text-slate-400">Amb Dispatched</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3.5 w-3.5 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-500 text-[7px] font-bold">!</div>
          <span className="text-slate-400">Active Patient (SOS)</span>
        </div>
      </div>
    </div>
  );
};

export default MapTracker;
