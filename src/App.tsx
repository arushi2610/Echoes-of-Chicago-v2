import React, { useState, useEffect } from 'react';
import { MapView } from './components/Map';
import { Sidebar } from './components/Sidebar';
import { MemoryPanel } from './components/MemoryPanel';
import { ShareMemoryModal } from './components/ShareMemoryModal';
import { ProfilePage } from './components/ProfilePage';
import { Memory } from './types';
import { memoryService } from './services/memoryService';
import { auth, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [savedMemoryIds, setSavedMemoryIds] = useState<Set<string>>(new Set());

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
    if (!user) {
      await signInWithGoogle();
      return;
    }
    const saved = await memoryService.saveMemory({
      ...newMemory,
      author: user.displayName || 'A Neighbor',
      authorId: user.uid
    });
    setMemories(prev => [saved, ...prev]);
    setSelectedMemory(saved);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white font-sans selection:bg-amber-400 selection:text-black">
      <Sidebar 
        memories={memories.filter(m => {
          const categoryMatch = !activeCategory || m.category === activeCategory;
          const searchMatch = !searchQuery || 
            m.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.title.toLowerCase().includes(searchQuery.toLowerCase());
          return categoryMatch && searchMatch;
        })}
        onMemoryClick={(memory) => setSelectedMemory(memory)}
        selectedMemoryId={selectedMemory?.id}
        onSearchChange={setSearchQuery}
        onCategoryToggle={(cat) => setActiveCategory(cat === activeCategory ? null : cat)}
        activeCategory={activeCategory}
        onProfileClick={() => setIsProfileOpen(true)}
      />
      
      <main className="flex-1 relative bg-black">
        <MapView 
          onMemoryClick={(memory) => setSelectedMemory(memory)}
          memories={memories}
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
        />

        <AnimatePresence>
          {isProfileOpen && (
            <ProfilePage 
              onClose={() => setIsProfileOpen(false)}
              onMemoryClick={(memory) => setSelectedMemory(memory)}
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

        {/* Floating Action Button */}
        <div className="absolute bottom-10 right-10 z-30 group">
          <AnimatePresence>
            {!isShareModalOpen && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none"
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
            className="w-16 h-16 bg-amber-400 text-black rounded-3xl shadow-[0_20px_50px_rgba(251,191,36,0.3)] flex items-center justify-center hover:bg-amber-300 transition-all border-2 border-white/20 relative"
          >
            <Plus className="w-8 h-8" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-amber-400">
              <Sparkles className="w-3 h-3 text-amber-500" />
            </div>
          </motion.button>
        </div>

        {/* Global UI Overlays */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-6">
          <div className="px-6 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Live Archive</span>
            </div>
            <div className="w-px h-3 bg-white/20" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{memories.length} Stories Collected</span>
          </div>
        </div>
      </main>
    </div>
  );
}

