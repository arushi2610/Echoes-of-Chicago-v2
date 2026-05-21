import React from 'react';
import { Memory } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, User, Tag, MapPin, Feather } from 'lucide-react';

interface MemoryPanelProps {
  memory: Memory | null;
  onClose: () => void;
  isSaved?: boolean;
  onSaveToggle?: (memoryId: string) => void;
}

export const MemoryPanel: React.FC<MemoryPanelProps> = ({ memory, onClose, isSaved, onSaveToggle }) => {
  if (!memory) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-6 right-6 bottom-6 w-[28rem] glass border-white/10 rounded-3xl shadow-[0_50px_100px_rgba(0,0,0,1)] p-0 z-40 text-white overflow-hidden flex flex-col pointer-events-auto"
      >
        {/* Memory Image Header */}
        <div className="relative h-48 bg-zinc-900 overflow-hidden">
          {memory.imageUrl ? (
            <img src={memory.imageUrl} alt="" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-500/20 to-blue-500/20 flex items-center justify-center">
              <Feather className="w-12 h-12 text-white/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full border border-white/10 transition-all group z-50"
          >
            <X className="w-5 h-5 text-zinc-400 group-hover:text-white" />
          </button>

          <div className="absolute bottom-6 left-8 right-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-amber-400 text-black text-[9px] font-bold uppercase tracking-[0.2em] rounded">
                {memory.category}
              </span>
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest pl-2 border-l border-white/10">
                {memory.era}
              </span>
            </div>
            <h2 className="text-2xl font-display font-bold leading-tight tracking-tight text-white drop-shadow-xl">
              {memory.title}
            </h2>
          </div>
        </div>

        <div className="p-8 space-y-8 flex-1 overflow-y-auto scrollbar-hide">
          {/* Metadata Row */}
          <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase font-bold tracking-[0.15em] border-b border-white/5 pb-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                <User className="w-3 h-3" />
              </div>
              <span className="text-white/80">{memory.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 opacity-50" />
              <span>{new Date(memory.timestamp).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Story Body */}
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-amber-400/50 via-amber-400/10 to-transparent" />
            <p className="text-lg leading-relaxed text-zinc-300 font-serif italic pl-2 first-letter:text-4xl first-letter:font-display first-letter:text-amber-400 first-letter:mr-1 first-letter:float-left">
              {memory.story}
            </p>
          </div>

          {/* Location Badge */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all duration-500">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.3)] group-hover:scale-105 transition-transform">
                <MapPin className="w-6 h-6 text-black" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1">Neighborhood</p>
                <p className="text-sm font-bold text-white">{memory.neighborhood}</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-zinc-600 group-hover:text-amber-400 transition-colors">
              <Feather className="w-4 h-4" />
            </div>
          </div>

          {/* Reactions or Interaction */}
          <div className="flex items-center gap-4 pt-4">
            <button 
              onClick={() => onSaveToggle?.(memory.id!)}
              className={`flex-1 py-3 px-6 border rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                isSaved 
                ? 'bg-amber-400 border-amber-400 text-black' 
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
              }`}
            >
              {isSaved ? 'Saved to Collection' : 'Save to Collection'}
            </button>
            <button className="flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
              Share Echo
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
