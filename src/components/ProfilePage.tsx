import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Heart, Clock, MapPin, ChevronRight, LogOut, Sparkles } from 'lucide-react';
import { auth } from '../lib/firebase';
import { Memory } from '../types';
import { memoryService } from '../services/memoryService';

interface ProfilePageProps {
  onClose: () => void;
  onMemoryClick: (memory: Memory) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onClose, onMemoryClick }) => {
  const [savedMemories, setSavedMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchSaved = async () => {
      setLoading(true);
      const memories = await memoryService.getSavedMemories();
      setSavedMemories(memories);
      setLoading(false);
    };
    fetchSaved();
  }, []);

  if (!user) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
        <button onClick={onClose} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors">
          <X className="w-8 h-8" />
        </button>
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-amber-400 rounded-3xl mx-auto flex items-center justify-center shadow-[0_20px_50px_rgba(251,191,36,0.3)]">
            <User className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-3xl font-display font-bold uppercase tracking-tight text-white">Join the Community</h2>
          <p className="text-zinc-500 text-sm leading-relaxed">Sign in to save your favorite echoes and record your own memories for future generations.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-2xl flex flex-col"
    >
      {/* Header */}
      <header className="p-8 flex justify-between items-center bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-6">
          <div className="relative group">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400/20 group-hover:ring-amber-400/50 transition-all duration-500" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <User className="w-8 h-8 text-black" />
              </div>
            )}
            <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold uppercase tracking-tight text-white">{user.displayName}</h1>
            <p className="text-[10px] text-amber-400/60 font-bold uppercase tracking-[0.3em] mt-1">{user.email}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => auth.signOut().then(() => onClose())}
            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group"
          >
            <X className="w-6 h-6 text-zinc-500 group-hover:text-white" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide px-8 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Sidebar Info */}
          <div className="space-y-12">
            <section className="space-y-6">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Personal Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all duration-500">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center mb-4 shadow-[0_10px_30px_rgba(251,191,36,0.2)]">
                    <Heart className="w-5 h-5 text-black" />
                  </div>
                  <p className="text-2xl font-display font-bold text-white mb-1">{savedMemories.length}</p>
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Saved Echoes</p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all duration-500">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center mb-4 shadow-[0_10px_30px_rgba(59,130,246,0.2)]">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-display font-bold text-white mb-1">Modern</p>
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Era Preference</p>
                </div>
              </div>
            </section>
          </div>

          {/* Saved Memories List */}
          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Saved Collection</h3>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-white/5 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : savedMemories.length > 0 ? (
              <div className="space-y-4">
                {savedMemories.map(memory => (
                  <button
                    key={memory.id}
                    onClick={() => {
                      onMemoryClick(memory);
                      onClose();
                    }}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 p-6 rounded-[2rem] flex items-center gap-6 transition-all duration-500 group text-left"
                  >
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-900 flex-shrink-0 border border-white/10">
                      {memory.imageUrl ? (
                        <img src={memory.imageUrl} alt="" className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                      ) : (
                        <div className="w-full h-full bg-amber-400/10 flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-amber-400/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-amber-400 px-1.5 py-0.5 bg-amber-400/10 rounded">
                          {memory.category}
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-600">
                          {memory.neighborhood}
                        </span>
                      </div>
                      <h4 className="text-lg font-display font-bold text-white truncate group-hover:text-amber-400 transition-colors uppercase tracking-tight">
                        {memory.title}
                      </h4>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-amber-400 group-hover:border-amber-400 transition-all duration-500">
                      <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-black" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                <div className="w-16 h-16 bg-white/5 rounded-full mx-auto flex items-center justify-center mb-6">
                  <Heart className="w-8 h-8 text-zinc-700" />
                </div>
                <h4 className="text-xl font-display font-medium text-zinc-500 mb-2">Your collection is empty</h4>
                <p className="text-sm text-zinc-700">Explore the map and save memories that resonate with you.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </motion.div>
  );
};
