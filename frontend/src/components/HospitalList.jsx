import React from 'react';
import { Hospital, Bed, MapPin, Phone } from 'lucide-react';

export const HospitalList = ({ hospitals = [], highlightedHospitalId = null }) => {
  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <Hospital className="h-5 w-5 text-blue-400" />
        <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">Hospital Bed Status Board</h2>
      </div>

      <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
        {hospitals.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm font-mono">
            Loading hospital indices...
          </div>
        ) : (
          hospitals.map((hosp) => {
            const bedRatio = hosp.availableBeds / hosp.totalBeds;
            const isFull = hosp.availableBeds === 0;
            const isHighlighted = highlightedHospitalId && hosp._id.toString() === highlightedHospitalId.toString();

            return (
              <div 
                key={hosp._id} 
                className={`border rounded-xl p-4 transition-all duration-300 ${
                  isHighlighted 
                    ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500/30' 
                    : 'bg-[#0a0f1d]/60 border-slate-800/80 hover:border-slate-700/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                      {hosp.name}
                      {isHighlighted && (
                        <span className="text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded font-mono font-normal uppercase">
                          Route Destination
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-3 w-3 text-slate-500" /> Grid: [{hosp.location?.x}, {hosp.location?.y}]
                      </span>
                      {hosp.distance !== undefined && (
                        <span className="text-blue-400 font-bold">
                          Dist: {hosp.distance} units
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`flex items-center gap-1 text-xs font-mono font-bold justify-end ${isFull ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                      <Bed className="h-3.5 w-3.5" />
                      <span>{hosp.availableBeds} / {hosp.totalBeds} Beds</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">ICU Occupancy</span>
                  </div>
                </div>

                {/* Bed status bar */}
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mb-3">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isFull 
                        ? 'bg-rose-500' 
                        : bedRatio < 0.3 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${(hosp.availableBeds / hosp.totalBeds) * 100}%` }}
                  />
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {hosp.specialties?.map((spec, i) => (
                    <span key={i} className="text-[9px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="border-t border-slate-800/60 pt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-500" /> {hosp.contact}
                  </span>
                  <span className="text-slate-500">24/7 Trauma Unit</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HospitalList;
