import React from 'react';
import { STORY_CATEGORIES, CHICAGO_COMMUNITY_AREAS } from '../constants';
import { Memory } from '../types';
import { Search, Filter, Feather, LogIn, User as UserIcon, X, MapPin, Loader2, Building2 } from 'lucide-react';
import { auth, signInWithGoogle } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { useMap } from 'react-map-gl/maplibre';

interface SidebarProps {
  memories: Memory[];
  onMemoryClick: (memory: Memory) => void;
  selectedMemoryId?: string;
  onSearchChange: (query: string) => void;
  onCategoryToggle: (category: string | null) => void;
  activeCategory: string | null;
  onProfileClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  memories,
  onMemoryClick,
  selectedMemoryId,
  onSearchChange,
  onCategoryToggle,
  activeCategory,
  onProfileClick
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [placeResults, setPlaceResults] = React.useState<any[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = React.useState(false);

  const { current: map } = useMap();

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange(value);

    if (value.length > 3) {
      setIsSearchingPlaces(true);
      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(value + ', Chicago')}&apiKey=7d2c0c6238e643ad8e6437592699aad0&limit=5`
        );
        const data = await response.json();
        const mappedResults = (data.features || []).map((f: any) => ({
          place_id: f.properties.place_id,
          lat: f.properties.lat,
          lon: f.properties.lon,
          display_name: f.properties.formatted || (f.properties.address_line1 + ', ' + f.properties.address_line2)
        }));
        setPlaceResults(mappedResults);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearchingPlaces(false);
      }
    } else {
      setPlaceResults([]);
    }
  };

  const handlePlaceSelect = (lat: string, lon: string, display_name: string) => {
    if (!map) return;
    map.flyTo({
      center: [parseFloat(lon), parseFloat(lat)],
      zoom: 16,
      duration: 2000
    });
    setSearchQuery(display_name.split(',')[0]);
    setIsSearchFocused(false);
  };

  const filteredNeighborhoods = React.useMemo(() => {
    if (!searchQuery) return CHICAGO_COMMUNITY_AREAS;
    return CHICAGO_COMMUNITY_AREAS.filter(n => 
      n.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleNeighborhoodSelect = (name: string) => {
    setSearchQuery(name);
    onSearchChange(name);
    setTimeout(() => setIsSearchFocused(false), 100);
  };

  return (
    <div className="w-80 h-full bg-black border-r border-white/5 flex flex-col z-20 shadow-2xl relative">
      {/* Header */}
      <div className="p-8 border-b border-white/5 bg-gradient-to-b from-zinc-950 to-black">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.3)]">
            <Feather className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold tracking-tight text-white uppercase leading-none flex items-baseline gap-1.5">
              Echoes
            </h1>
            <p className="text-[10px] text-amber-400/60 uppercase tracking-[0.2em] font-bold mt-1">of Chicago</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-6 space-y-6 flex-1 overflow-y-auto scrollbar-hide">
        <div className="relative group z-30">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-amber-400 transition-colors" />
          <input 
            type="text"
            placeholder="Search neighborhood..."
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => setIsSearchFocused(true)}
            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-all font-display text-white placeholder:text-zinc-600"
          />
          
          <AnimatePresence>
            {isSearchFocused && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSearchFocused(false)}
                  className="fixed inset-0 z-[-1]"
                />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass z-50 p-2"
                >
                  <div className="max-h-[70vh] overflow-y-auto scrollbar-hide space-y-4 p-1">
                    {placeResults.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-3 py-2 text-[9px] font-bold text-amber-400 uppercase tracking-widest flex items-center justify-between">
                          <span>Places in Chicago</span>
                          {isSearchingPlaces && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                        </div>
                        {placeResults.map(p => (
                          <button
                            key={p.place_id}
                            onClick={() => handlePlaceSelect(p.lat, p.lon, p.display_name)}
                            className="w-full text-left px-4 py-3 hover:bg-white/5 rounded-xl transition-colors flex items-start gap-3 group"
                          >
                            <Building2 className="w-3.5 h-3.5 text-zinc-600 group-hover:text-amber-400 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-display text-zinc-300 group-hover:text-white truncate">{p.display_name.split(',')[0]}</p>
                              <p className="text-[10px] text-zinc-600 truncate">{p.display_name.split(',').slice(1).join(',')}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="px-3 py-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest border-t border-white/5 pt-3 mt-2">
                        Community Areas
                      </div>
                      {filteredNeighborhoods.map(n => (
                        <button
                          key={n}
                          onClick={() => handleNeighborhoodSelect(n)}
                          className="w-full text-left px-4 py-3 hover:bg-white/5 rounded-xl transition-colors flex items-center gap-3 group"
                        >
                          <MapPin className="w-3 h-3 text-zinc-600 group-hover:text-amber-400 transition-colors" />
                          <span className="text-sm font-display text-zinc-300 group-hover:text-white transition-colors">{n}</span>
                        </button>
                      ))}
                    </div>

                    {filteredNeighborhoods.length === 0 && placeResults.length === 0 && !isSearchingPlaces && (
                      <div className="px-4 py-8 text-center text-zinc-600 text-xs italic">
                        No results found
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4 px-2">
            <Filter className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Filter by Echo Type</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onCategoryToggle(null)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeCategory === null 
                  ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.2)]' 
                  : 'bg-white/5 text-zinc-500 hover:bg-white/10 border border-white/5'
              }`}
            >
              All
            </button>
            {STORY_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => onCategoryToggle(cat)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                    ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.2)]' 
                    : 'bg-white/5 text-zinc-500 hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Memory Feed */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Recent Echoes</span>
            <span className="text-[10px] font-bold text-amber-400/40">{memories.length}</span>
          </div>
          
          <div className="space-y-3">
            {memories.map(memory => (
              <button
                key={memory.id}
                onClick={() => onMemoryClick(memory)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden ${
                  selectedMemoryId === memory.id
                    ? 'bg-amber-400 border-amber-400 shadow-[0_10px_30px_rgba(251,191,36,0.15)]'
                    : 'bg-zinc-900/50 border-white/5 hover:bg-white/5 hover:border-white/10'
                }`}
              >
                {selectedMemoryId === memory.id && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 blur-2xl -translate-y-8 translate-x-8" />
                )}
                <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                  selectedMemoryId === memory.id ? 'text-black/60' : 'text-amber-400/40'
                }`}>
                  {memory.neighborhood}
                </div>
                <h3 className={`text-sm font-display font-bold mb-1 truncate ${
                  selectedMemoryId === memory.id ? 'text-black' : 'text-white'
                }`}>
                  {memory.title}
                </h3>
                <div className="flex items-center gap-2">
                  <div className={`w-1 h-1 rounded-full ${selectedMemoryId === memory.id ? 'bg-black/20' : 'bg-amber-400/40'}`} />
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${
                    selectedMemoryId === memory.id ? 'text-black/40' : 'text-zinc-600'
                  }`}>{memory.category}</span>
                </div>
              </button>
            ))}
            {memories.length === 0 && (
              <div className="text-center py-12">
                <Feather className="w-8 h-8 text-zinc-800 mx-auto mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">No echoes found in this sector</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User / Footer */}
      <div className="p-8 border-t border-white/5 bg-zinc-950/50 backdrop-blur-md">
        {auth.currentUser ? (
          <div className="flex items-center gap-4">
            <button 
              onClick={onProfileClick}
              className="relative group flex-shrink-0"
            >
              <img 
                src={auth.currentUser.photoURL || ''} 
                alt="" 
                className="w-10 h-10 rounded-xl border border-white/10 p-0.5 group-hover:border-amber-400/50 transition-colors" 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-black flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-black rounded-full" />
              </div>
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate group-hover:text-amber-400 cursor-pointer" onClick={onProfileClick}>{auth.currentUser.displayName}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <button 
                  onClick={onProfileClick}
                  className="text-[9px] text-amber-400 hover:text-amber-300 uppercase tracking-widest font-bold transition-colors"
                >
                  My Collection
                </button>
                <div className="w-1 h-1 rounded-full bg-zinc-800" />
                <button 
                  onClick={() => auth.signOut()} 
                  className="text-[9px] text-zinc-500 hover:text-zinc-400 uppercase tracking-widest font-bold transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-amber-400 hover:bg-amber-300 rounded-2xl text-black transition-all group font-display font-bold uppercase tracking-widest text-[10px] shadow-[0_10px_20px_rgba(251,191,36,0.1)] active:scale-[0.98]"
          >
            <LogIn className="w-4 h-4" />
            Sign in to Echo
          </button>
        )}
      </div>
    </div>
  );
};
