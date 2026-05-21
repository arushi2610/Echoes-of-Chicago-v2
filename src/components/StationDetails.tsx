import React from 'react';
import { StationFeature } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Accessibility, Train, Navigation } from 'lucide-react';
import { LINE_COLORS } from '../constants';

interface StationDetailsProps {
  station: StationFeature | null;
  onClose: () => void;
}

export const StationDetails: React.FC<StationDetailsProps> = ({ station, onClose }) => {
  if (!station) return null;

  const props = station.properties;
  
  const activeLines = [
    { code: 'RD', name: 'Red Line', active: props.red },
    { code: 'BL', name: 'Blue Line', active: props.blue },
    { code: 'BR', name: 'Brown Line', active: props.brn },
    { code: 'GR', name: 'Green Line', active: props.g },
    { code: 'OR', name: 'Orange Line', active: props.o },
    { code: 'PK', name: 'Pink Line', active: props.pnk },
    { code: 'PR', name: 'Purple Line', active: props.p },
    { code: 'YL', name: 'Yellow Line', active: props.y },
  ].filter(l => l.active);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-6 right-6 w-96 bg-zinc-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 z-30 text-white pointer-events-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="px-2 py-0.5 bg-white/10 text-white/60 text-[10px] font-bold uppercase tracking-widest rounded border border-white/5">
            Rail Station
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-2 leading-tight tracking-tight">
          {props.station_name}
        </h2>
        <p className="text-sm text-white/50 mb-8 font-medium">
          {props.station_descriptive_name}
        </p>

        <div className="space-y-8">
          <section>
            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Train className="w-3 h-3" />
              Lines Served
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {activeLines.map(line => (
                <div 
                  key={line.code}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 transition-all hover:bg-white/10"
                >
                  <div 
                    className="w-2.5 h-2.5 rounded-full ring-2 ring-white/10"
                    style={{ backgroundColor: LINE_COLORS[line.code] }}
                  />
                  <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">{line.name}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              Location
            </h3>
            <div className="space-y-1 bg-white/5 p-4 rounded-xl border border-white/5">
              <p className="text-sm text-white/80 font-medium">
                {props.location_address || 'Address not listed'}
              </p>
              <p className="text-xs text-white/40">
                {props.location_city}, IL {props.location_zip}
              </p>
            </div>
          </section>

          <section className="pt-6 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-full ${props.ada ? 'bg-green-500/10' : 'bg-white/5'}`}>
                <Accessibility className={`w-4 h-4 ${props.ada ? 'text-green-400' : 'text-white/20'}`} />
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-widest ${props.ada ? 'text-green-400' : 'text-white/30'}`}>
                {props.ada ? 'ADA Accessible' : 'Limited Access'}
              </span>
            </div>
            
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${station.geometry.coordinates[1]},${station.geometry.coordinates[0]}`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-white text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center gap-2"
            >
              <Navigation className="w-3 h-3" />
              Route
            </a>
          </section>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
