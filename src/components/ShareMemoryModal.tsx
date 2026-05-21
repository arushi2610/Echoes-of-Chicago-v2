import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Feather, MapPin, Sparkles, ChevronDown, Camera, Upload, Loader2, Map as MapIcon } from 'lucide-react';
import { STORY_CATEGORIES, CHICAGO_COMMUNITY_AREAS } from '../constants';
import { Memory } from '../types';

interface ShareMemoryModalProps {
  onClose: () => void;
  onSave: (memory: Omit<Memory, 'id'>) => void;
}

export const ShareMemoryModal: React.FC<ShareMemoryModalProps> = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [era, setEra] = useState('Modern Day');
  const [category, setCategory] = useState(STORY_CATEGORIES[0]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredNeighborhoods = CHICAGO_COMMUNITY_AREAS.filter(n => 
    n.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const geocodeAddress = async (addr: string): Promise<[number, number] | null> => {
    if (!addr) return null;
    
    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr + ', Chicago, IL')}&limit=1`
      );
      const data = await response.json();
      
      if (data && data[0]) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsGeocoding(false);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!neighborhood) return;

    // Default: Small randomization within a broad Chicago area if no address
    let coords: [number, number] = [41.8781 + (Math.random() - 0.5) * 0.1, -87.6298 + (Math.random() - 0.5) * 0.1];
    
    if (address) {
      const geoCoords = await geocodeAddress(address);
      if (geoCoords) coords = geoCoords;
    }

    onSave({
      title,
      story,
      neighborhood: neighborhood,
      address: address || undefined,
      imageUrl: imageUrl || undefined,
      era,
      category,
      author: 'A Neighbor',
      timestamp: new Date().toISOString(),
      coordinates: coords,
      isUnlocked: true,
      authorId: 'anonymous'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 40 }}
        className="relative w-full max-w-4xl glass border-white/10 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,1)] text-white overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-200 to-blue-500 rounded-t-[2.5rem]" />
        
        <div className="p-10 space-y-8 max-h-[90vh] overflow-y-auto scrollbar-hide">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold uppercase tracking-tight">Record an Echo</h2>
                <p className="text-[10px] text-amber-400/60 uppercase tracking-[0.3em] font-bold mt-1">Chicago Memory Project</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all group">
              <X className="w-5 h-5 text-zinc-500 group-hover:text-white" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                {/* Image Upload Section */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] px-1">Visual Echo (Optional)</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative w-full aspect-video bg-white/5 border-2 border-dashed border-white/10 rounded-[2rem] overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:border-amber-400/50 hover:bg-white/10 transition-all duration-500"
                  >
                    {imageUrl ? (
                      <>
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-[10px] font-bold uppercase tracking-widest">
                            Change Image
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-amber-400 group-hover:text-black transition-all">
                          {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                        </div>
                        <p className="text-xs text-zinc-500 group-hover:text-zinc-300">Drop a photo or click to upload</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] px-1">Echo Title</label>
                  <input
                    autoFocus
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-all font-display text-lg tracking-tight placeholder:text-zinc-700 font-bold"
                    placeholder="Wandering the Loop..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 relative">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] px-1">Neighborhood</label>
                    <button
                      type="button"
                      onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                      className={`w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pl-11 flex items-center justify-between transition-all font-display text-base tracking-tight ${neighborhood ? 'text-white' : 'text-zinc-700'}`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="absolute left-4 top-13 w-4 h-4 text-zinc-600" />
                        <span className="truncate">{neighborhood || 'Select Area'}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isSelectorOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isSelectorOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute left-0 right-0 top-full mt-2 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl glass z-[60] overflow-hidden"
                        >
                          <div className="p-3 border-b border-white/5">
                            <input 
                              type="text"
                              autoFocus
                              placeholder="Type to filter..."
                              value={searchQuery}
                              onChange={e => setSearchQuery(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-amber-400/50 transition-all font-sans"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto scrollbar-hide py-2 text-white">
                            {filteredNeighborhoods.map(n => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => {
                                  setNeighborhood(n);
                                  setIsSelectorOpen(false);
                                }}
                                className="w-full text-left px-5 py-2.5 text-xs hover:bg-amber-400 hover:text-black transition-colors font-sans"
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] px-1">Era</label>
                    <select
                      value={era}
                      onChange={e => setEra(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-amber-400/50 transition-all appearance-none bg-none"
                    >
                      <option value="Modern Day">Modern Day</option>
                      <option value="2000s">2000s</option>
                      <option value="1990s">1990s</option>
                      <option value="1980s">1980s</option>
                      <option value="1970s">1970s</option>
                      <option value="Golden Age">Golden Age (1920-50)</option>
                      <option value="Historic">Historic Chicago</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] px-1">Precise Address (Optional)</label>
                  <div className="relative">
                    <MapIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pl-11 focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-all font-sans text-sm tracking-tight placeholder:text-zinc-700"
                      placeholder="e.g. 100 S Wacker Dr, Chicago, IL"
                    />
                    {isGeocoding && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] text-zinc-600 px-1 italic">Adding an address pins your echo exactly where it happened.</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] px-1">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {STORY_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all border ${
                          category === cat 
                            ? 'bg-amber-400 border-amber-400 text-black' 
                            : 'bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 flex-1 flex flex-col">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] px-1">The Memory</label>
                  <textarea
                    required
                    value={story}
                    onChange={e => setStory(e.target.value)}
                    className="w-full flex-1 bg-white/5 border border-white/10 rounded-[2rem] px-6 py-6 font-serif italic text-lg resize-none min-h-[14rem] leading-relaxed focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-all placeholder:text-zinc-700"
                    placeholder="Tell your story..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGeocoding || isUploading}
                  className="w-full bg-amber-400 text-black py-5 rounded-2xl font-display font-bold uppercase tracking-[0.4em] text-xs hover:bg-amber-300 transition-all shadow-[0_20px_40px_-10px_rgba(251,191,36,0.3)] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <Feather className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Seal Echo into the Map
                </button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

