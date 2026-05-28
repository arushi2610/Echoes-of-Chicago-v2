import React, { useState, useEffect } from 'react';
import { MapView } from './components/Map';
import { Sidebar } from './components/Sidebar';
import { MemoryPanel } from './components/MemoryPanel';
import { ShareMemoryModal } from './components/ShareMemoryModal';
import { ProfilePage } from './components/ProfilePage';
import { Memory } from './types';
import { memoryService } from './services/memoryService';
import { auth, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseAuthUser } from 'firebase/auth';
import { Plus, Sparkles, List, Map as MapIcon, Feather, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMap } from 'react-map-gl/maplibre';

export default function App() {
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<FirebaseAuthUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [savedMemoryIds, setSavedMemoryIds] = useState<Set<string>>(new Set());
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');
  const { current: map } = useMap();

  const handleMemoryClick = (memory: Memory) => {
    setSelectedMemory(memory);
    setMobileTab('map');
    if (map) {
      map.flyTo({
        center: [memory.coordinates[1], memory.coordinates[0]],
        zoom: 15,
        duration: 1500
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const ids = await memoryService.getSavedMemoryIds();
        setSavedMemoryIds(new Set(ids));
      } else {
        setSavedMemoryIds(new Set());
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSaveToCollection = async (memoryId: string) => {
    if (!auth.currentUser) return;
    try {
      if (savedMemoryIds.has(memoryId)) {
        await memoryService.removeFromCollection(memoryId);
        const next = new Set(savedMemoryIds);
        next.delete(memoryId);
        setSavedMemoryIds(next);
      } else {
        await memoryService.saveToCollection(memoryId);
        const next = new Set(savedMemoryIds);
        next.add(memoryId);
        setSavedMemoryIds(next);
      }
    } catch (error) {
       console.error("Error toggling saved state:", error);
    }
  };

  useEffect(() => {
    memoryService.getMemories().then(setMemories);
  }, []);

  const handleSaveMemory = async (newMemory: Omit<Memory, 'id'>) => {
    let currentUser = user;
    if (!currentUser) {
      try {
        currentUser = await signInWithGoogle();
      } catch (err) {
        throw new Error('You must be signed in to store an echo.');
      }
    }
    const saved = await memoryService.saveMemory({
      ...newMemory,
      author: currentUser.displayName || 'A Neighbor',
      authorId: currentUser.uid
    });
    setMemories(prev => [saved, ...prev]);
    setSelectedMemory(saved);
  };

  const handleDeleteMemory = async (memoryId: string) => {
    try {
      await memoryService.deleteMemory(memoryId);
      setMemories(prev => prev.filter(m => m.id !== memoryId));
      if (selectedMemory?.id === memoryId) {
        setSelectedMemory(null);
      }
    } catch (err) {
      console.error('Failed to delete echo:', err);
      alert('Failed to delete echo.');
    }
  };

  const visibleMemories = memories.filter(m => !m.isPrivate || (user && m.authorId === user.uid));

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-screen overflow-hidden bg-black text-white font-sans selection:bg-amber-400 selection:text-black">
      <div className={`${mobileTab === 'list' ? 'flex' : 'hidden'} md:flex h-full w-full md:w-auto relative z-20`}>
        <Sidebar 
          memories={visibleMemories.filter(m => {
            const categoryMatch = !activeCategory || m.category === activeCategory;
            const searchMatch = !searchQuery || 
              m.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
              m.title.toLowerCase().includes(searchQuery.toLowerCase());
            return categoryMatch && searchMatch;
          })}
          onMemoryClick={handleMemoryClick}
          selectedMemoryId={selectedMemory?.id}
          onSearchChange={setSearchQuery}
          onCategoryToggle={(cat) => setActiveCategory(cat === activeCategory ? null : cat)}
          activeCategory={activeCategory}
          onProfileClick={() => setIsProfileOpen(true)}
        />
      </div>
      
      <main className={`flex-1 relative bg-black ${mobileTab === 'map' ? 'block' : 'hidden'} md:block h-full`}>
        <MapView 
          onMemoryClick={handleMemoryClick}
          memories={visibleMemories}
          selectedMemoryId={selectedMemory?.id}
          filterCategory={activeCategory || undefined}
          searchQuery={searchQuery}
          onNeighborhoodClick={(name) => setSearchQuery(name)}
        />
        
        <MemoryPanel 
          memory={selectedMemory}
          onClose={() => setSelectedMemory(null)}
          isSaved={selectedMemory ? savedMemoryIds.has(selectedMemory.id) : false}
          onSaveToggle={handleSaveToCollection}
          onDelete={handleDeleteMemory}
          onLike={(id) => {
            setMemories(prev => prev.map(m => m.id === id ? { ...m, reactions: (m.reactions || 0) + 1 } : m));
          }}
        />

        {/* Floating Action Button */}
        <div className="absolute bottom-24 right-4 md:bottom-10 md:right-10 z-30 group">
          <AnimatePresence>
            {!isShareModalOpen && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none hidden md:block"
              >
                <div className="bg-amber-400 text-black px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl border border-white/20">
                  Record an Echo
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsShareModalOpen(true)}
            className="w-14 h-14 md:w-16 md:h-16 bg-amber-400 text-black rounded-full md:rounded-3xl shadow-[0_20px_50px_rgba(251,191,36,0.3)] flex items-center justify-center hover:bg-amber-300 transition-all border-2 border-white/20 relative"
          >
            <Plus className="w-6 h-6 md:w-8 md:h-8" />
            <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-amber-400">
              <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3 text-amber-500" />
            </div>
          </motion.button>
        </div>

        {/* Global UI Overlays */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-6">
          <div className="px-4 md:px-6 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2 md:gap-4 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white/60">Live</span>
            </div>
            <div className="w-px h-3 bg-white/20" />
            <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white/40">{memories.length} Stories</span>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isProfileOpen && (
          <ProfilePage 
            onClose={() => setIsProfileOpen(false)}
            onMemoryClick={handleMemoryClick}
            memories={memories}
            savedMemoryIds={savedMemoryIds}
            user={user}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isShareModalOpen && (
          <ShareMemoryModal 
            onClose={() => setIsShareModalOpen(false)}
            onSave={handleSaveMemory}
          />
        )}
      </AnimatePresence>

      {/* Mobile Tab Navigation */}
      <div className="flex md:hidden absolute bottom-0 left-0 right-0 h-[72px] bg-black/90 backdrop-blur-md border-t border-white/10 z-[70] items-center justify-around px-4 pb-safe">
        <button 
          onClick={() => { setMobileTab('list'); setIsProfileOpen(false); }}
          className={`flex flex-col items-center justify-center gap-1.5 w-1/3 h-full ${mobileTab === 'list' && !isProfileOpen ? 'text-amber-400' : 'text-zinc-500 hover:text-white'}`}
        >
          <List className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Browse</span>
        </button>
        <button 
          onClick={() => { setMobileTab('map'); setIsProfileOpen(false); }}
          className={`flex flex-col items-center justify-center gap-1.5 w-1/3 h-full ${mobileTab === 'map' && !isProfileOpen ? 'text-amber-400' : 'text-zinc-500 hover:text-white'}`}
        >
          <MapIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Map</span>
        </button>
        <button 
          onClick={() => setIsProfileOpen(true)}
          className={`flex flex-col items-center justify-center gap-1.5 w-1/3 h-full ${isProfileOpen ? 'text-amber-400' : 'text-zinc-500 hover:text-white'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
        </button>
      </div>
    </div>
  );
}

