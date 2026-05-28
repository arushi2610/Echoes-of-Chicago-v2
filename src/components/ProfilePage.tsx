import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Heart, Clock, MapPin, ChevronRight, LogOut, Sparkles, Lock, Globe, Mic } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithGoogle } from '../lib/firebase';
import { Memory } from '../types';
import { memoryService } from '../services/memoryService';
import savedEmptyStateImage from '../assets/images/empty_saved_echoes_1780002660397.png';
import myEchoesEmptyStateImage from '../assets/images/empty_my_echoes_1780002683330.png';

interface ProfilePageProps {
  onClose: () => void;
  onMemoryClick: (memory: Memory) => void;
  memories: Memory[];
  savedMemoryIds: Set<string>;
  user: any;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onClose, onMemoryClick, memories, savedMemoryIds, user }) => {
  const [activeTab, setActiveTab] = useState<'myEchoes' | 'saved'>('myEchoes');

  const myEchoes = memories.filter(m => m.authorId === user?.uid);
  const savedMemories = memories.filter(m => m.id && savedMemoryIds.has(m.id));

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
          <p className="text-zinc-500 text-sm leading-relaxed mb-8">Sign in to save your favorite echoes and record your own memories for future generations.</p>
          <button
            onClick={signInWithGoogle}
            className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-2xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-3"
          >
            <Sparkles className="w-4 h-4" />
            Sign in to Echo
          </button>
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
      <header className="px-6 py-6 border-b border-white/5 bg-white/5 lg:px-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center w-full">
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="relative group">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl object-cover ring-2 ring-amber-400/20 group-hover:ring-amber-400/50 transition-all duration-500" />
              ) : (
                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <User className="w-6 h-6 lg:w-8 lg:h-8 text-black" />
                </div>
              )}
              <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-display font-bold uppercase tracking-tight text-white">{user.displayName}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <button 
              onClick={() => auth.signOut().then(() => onClose())}
              className="hidden md:flex px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
            <button 
              onClick={() => auth.signOut().then(() => onClose())}
              className="md:hidden p-3 text-zinc-500 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group"
            >
              <X className="w-5 h-5 lg:w-6 lg:h-6 text-zinc-500 group-hover:text-white" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide px-6 py-6 pb-24 lg:px-8 lg:py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
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
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-display font-bold text-white mb-1">{myEchoes.length}</p>
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Echoes Shared</p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all duration-500 col-span-2">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/10">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xl font-display font-bold text-white mb-0.5">Community Member</p>
                      <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Since {new Date().getFullYear()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Saved Memories List */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-6 border-b border-white/10 pb-4">
              <button 
                onClick={() => setActiveTab('myEchoes')}
                className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-colors relative pb-4 -mb-4 ${activeTab === 'myEchoes' ? 'text-amber-400' : 'text-zinc-500 hover:text-white'}`}
              >
                My Echoes
                {activeTab === 'myEchoes' && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
                )}
              </button>
              <button 
                onClick={() => setActiveTab('saved')}
                className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-colors relative pb-4 -mb-4 ${activeTab === 'saved' ? 'text-amber-400' : 'text-zinc-500 hover:text-white'}`}
              >
                Saved Collection
                {activeTab === 'saved' && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
                )}
              </button>
            </div>
            
            {activeTab === 'saved' ? (
              savedMemories.length > 0 ? (
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
                          <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-600 truncate">
                            {memory.neighborhood}
                          </span>
                          {memory.isPrivate && (
                            <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-zinc-500 ml-auto whitespace-nowrap">
                              <Lock className="w-2.5 h-2.5" />
                              Private
                            </span>
                          )}
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
                <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10 overflow-hidden relative">
                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <img src={savedEmptyStateImage} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full mx-auto flex items-center justify-center mb-6 bg-clip-padding backdrop-filter backdrop-blur-md border border-white/10">
                      <Heart className="w-8 h-8 text-zinc-400" />
                    </div>
                    <h4 className="text-xl font-display font-medium text-white mb-2">Your collection is empty</h4>
                    <p className="text-sm text-zinc-400">Explore the map and save memories that resonate with you.</p>
                  </div>
                </div>
              )
            ) : (
              myEchoes.length > 0 ? (
                <div className="space-y-4">
                  {myEchoes.map(memory => (
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
                          <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-600 truncate">
                            {memory.neighborhood}
                          </span>
                          {memory.isPrivate && (
                            <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-zinc-500 ml-auto whitespace-nowrap">
                              <Lock className="w-2.5 h-2.5" />
                              Private
                            </span>
                          )}
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
                <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10 overflow-hidden relative">
                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                     <img src={myEchoesEmptyStateImage} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full mx-auto flex items-center justify-center mb-6 bg-clip-padding backdrop-filter backdrop-blur-md border border-white/10">
                      <Mic className="w-8 h-8 text-zinc-400" />
                    </div>
                    <h4 className="text-xl font-display font-medium text-white mb-2">You haven't shared any Echoes yet</h4>
                    <p className="text-sm text-zinc-400">Record a unique story to share it with your neighbors.</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </motion.div>
  );
};
