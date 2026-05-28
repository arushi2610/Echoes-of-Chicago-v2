import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Map, { Marker, Source, Layer, NavigationControl, LayerProps, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CTA_STATIONS_URL, CTA_LINES_URL, NEIGHBORHOODS_URL } from '../constants';
import { StationFeature, Memory } from '../types';
import { MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MapViewProps {
  onNeighborhoodClick?: (name: string) => void;
  onMemoryClick: (memory: Memory) => void;
  memories: Memory[];
  selectedMemoryId?: string;
  filterCategory?: string;
  searchQuery?: string;
}

const extractColors = (linesStr: string | undefined): string[] => {
  if (!linesStr) return [];
  const l = linesStr.toLowerCase();
  const colors: string[] = [];
  if (l.includes('red') || l.includes('rd')) colors.push('#C60C30');
  if (l.includes('blue') || l.includes('bl')) colors.push('#00A1DE');
  if (l.includes('brown') || l.includes('br')) colors.push('#62361B');
  if (l.includes('green') || l.includes('gr')) colors.push('#009B3A');
  if (l.includes('orange') || l.includes('or')) colors.push('#F9461C');
  if (l.includes('pink') || l.includes('pk')) colors.push('#E27EA6');
  if (l.includes('purple') || l.includes('pr')) colors.push('#522398');
  if (l.includes('yellow') || l.includes('yl')) colors.push('#F9E300');
  return colors;
};

const CATEGORY_COLORS: Record<string, string> = {
  'Food': '#C60C30', // Red
  'Culture': '#E27EA6', // Pink
  'Childhood': '#F9E300', // Yellow
  'Music': '#00A1DE', // Blue
  'Student Life': '#009B3A', // Green
  'Nightlife': '#522398', // Purple
  'Immigration': '#62361B', // Brown
  'Local History': '#F9461C', // Orange
};

export const MapView: React.FC<MapViewProps> = ({ 
  onNeighborhoodClick,
  onMemoryClick,
  memories,
  selectedMemoryId,
  filterCategory,
  searchQuery
}) => {
  const [stations, setStations] = useState<any[]>([]);
  const [railLines, setRailLines] = useState<any>(null);
  const [neighborhoods, setNeighborhoods] = useState<any>(null);
  const [hoveredNeighborhood, setHoveredNeighborhood] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [stationsRes, linesRes, neighborhoodRes] = await Promise.all([
          fetch(CTA_STATIONS_URL),
          fetch(CTA_LINES_URL),
          fetch(NEIGHBORHOODS_URL)
        ]);
        const stationsData = await stationsRes.json();
        const linesData = await linesRes.json();
        const neighborhoodData = await neighborhoodRes.json();

        // Process color for stations
        const processedStations = (stationsData.features || []).map((f: any) => {
          const linesVal = f.properties?.lines || f.properties?.station_descriptive_name || '';
          
          let color = '#52525b';
          // Stations use boolean flags instead of strings usually, but let's check both
          const props = f.properties || {};
          if (props.red) color = '#C60C30';
          else if (props.blue) color = '#00A1DE';
          else if (props.brn) color = '#62361B';
          else if (props.g) color = '#009B3A';
          else if (props.o) color = '#F9461C';
          else if (props.pnk) color = '#E27EA6';
          else if (props.p) color = '#522398';
          else if (props.y) color = '#F9E300';
          else {
            const colors = extractColors(linesVal);
            if (colors.length > 0) color = colors[0];
          }

          return {
            ...f,
            properties: {
              ...f.properties,
              color
            }
          };
        });

        // Process color for lines
        const processedLinesFeatures: any[] = [];
        (linesData.features || []).forEach((f: any) => {
          const linesVal = f.properties?.lines || f.properties?.line || '';
          const colors = extractColors(linesVal);

          if (colors.length === 0) {
            processedLinesFeatures.push({
              ...f,
              properties: { ...f.properties, color: '#52525b', offset: 0 }
            });
          } else if (colors.length === 1) {
            processedLinesFeatures.push({
              ...f,
              properties: { ...f.properties, color: colors[0], offset: 0 }
            });
          } else {
            // Multiple parallel lines need offsets
            const SPACING = 3;
            const startOffset = -((colors.length - 1) * SPACING) / 2;
            colors.forEach((color, i) => {
              processedLinesFeatures.push({
                ...f,
                properties: { ...f.properties, color, offset: startOffset + (i * SPACING) }
              });
            });
          }
        });

        const processedLines = {
          ...linesData,
          features: processedLinesFeatures
        };

        setStations(processedStations);
        setRailLines(processedLines);
        setNeighborhoods(neighborhoodData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMemories = useMemo(() => {
    return memories.filter(m => {
      const categoryMatch = !filterCategory || m.category === filterCategory;
      const searchMatch = !searchQuery || 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [memories, filterCategory, searchQuery]);

  const [hoveredId, setHoveredId] = useState<string | number | null>(null);

  const onHover = useCallback((event: any) => {
    const feature = event.features && event.features[0];
    const map = event.target;
    
    if (hoveredId !== null) {
      map.setFeatureState(
        { source: 'neighborhoods', id: hoveredId },
        { hover: false }
      );
    }

    if (feature) {
      const newHoveredId = feature.id || feature.properties.area_numbe;
      setHoveredId(newHoveredId);
      map.setFeatureState(
        { source: 'neighborhoods', id: newHoveredId },
        { hover: true }
      );
      setHoveredNeighborhood(feature.properties.community);
    } else {
      setHoveredId(null);
      setHoveredNeighborhood(null);
    }
  }, [hoveredId]);

  const onClick = useCallback((event: any) => {
    const feature = event.features && event.features[0];
    if (feature && feature.layer.id === 'neighborhood-fill') {
      onNeighborhoodClick?.(feature.properties.community);
    }
  }, [onNeighborhoodClick]);

  const neighborhoodFillLayer: LayerProps = {
    id: 'neighborhood-fill',
    type: 'fill',
    paint: {
      'fill-color': '#fbbf24',
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.15,
        0.02
      ]
    }
  };

  const neighborhoodLineLayer: LayerProps = {
    id: 'neighborhood-line',
    type: 'line',
    paint: {
      'line-color': '#fbbf24',
      'line-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        2,
        1
      ],
      'line-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.8,
        0.3
      ]
    }
  };

  const railLinesLayer: LayerProps = {
    id: 'rail-lines',
    type: 'line',
    paint: {
      'line-color': ['get', 'color'],
      'line-width': 2.5,
      'line-opacity': 0.9,
      'line-offset': ['get', 'offset']
    }
  };

  const railLinesGlowLayer: LayerProps = {
    id: 'rail-lines-glow',
    type: 'line',
    paint: {
      'line-color': ['get', 'color'],
      'line-width': 6,
      'line-opacity': 0.2,
      'line-blur': 3,
      'line-offset': ['get', 'offset']
    }
  };

  const stationsGlowLayer: LayerProps = {
    id: 'stations-glow',
    type: 'circle',
    paint: {
      'circle-radius': 5.5,
      'circle-color': ['get', 'color'],
      'circle-opacity': 0.3,
      'circle-blur': 1
    }
  };

  const stationsDotLayer: LayerProps = {
    id: 'stations-dots',
    type: 'circle',
    paint: {
      'circle-radius': 3,
      'circle-color': ['get', 'color'],
      'circle-stroke-width': 1.2,
      'circle-stroke-color': '#000000',
      'circle-opacity': 0.95
    }
  };

  return (
    <div className="w-full h-full relative bg-black">
      <Map
        initialViewState={{
          latitude: 41.8781,
          longitude: -87.6298,
          zoom: 11
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        interactiveLayerIds={['neighborhood-fill']}
        onMouseMove={onHover}
        onClick={onClick}
      >
        <NavigationControl position="top-left" style={{ marginTop: '50px', marginLeft: '16px' }} />

        {neighborhoods && (
          <Source id="neighborhoods" type="geojson" data={neighborhoods}>
            <Layer {...neighborhoodFillLayer} />
            <Layer {...neighborhoodLineLayer} />
          </Source>
        )}

        {/* CTA Rail Track Lines */}
        {railLines && (
          <Source id="cta-lines" type="geojson" data={railLines}>
            <Layer {...railLinesGlowLayer} />
            <Layer {...railLinesLayer} />
          </Source>
        )}

        {/* CTA Stations Points */}
        {stations.length > 0 && (
          <Source id="cta-stations" type="geojson" data={{ type: 'FeatureCollection', features: stations }}>
            <Layer {...stationsGlowLayer} />
            <Layer {...stationsDotLayer} />
          </Source>
        )}

        {/* Memory Markers */}
        {filteredMemories.map(memory => {
          const isSelected = memory.id === selectedMemoryId;
          const markerColor = CATEGORY_COLORS[memory.category] || '#fbbf24'; // Default to amber
          
          return (
            <Marker
              key={memory.id}
              latitude={memory.coordinates[0]}
              longitude={memory.coordinates[1]}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onMemoryClick(memory);
              }}
            >
              <motion.div 
                className="relative group cursor-pointer"
                whileHover={{ scale: 1.15 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {/* Glow effect */}
                <div className={`absolute -inset-4 rounded-full blur-xl transition-all duration-500 opacity-50 group-hover:opacity-100 ${
                  isSelected ? 'scale-150' : ''
                }`} style={{ backgroundColor: markerColor }} />
                
                <div className={`relative p-2 rounded-full border transition-all duration-500`}
                  style={{
                    backgroundColor: isSelected ? markerColor : '#18181b',
                    color: isSelected ? '#000' : markerColor,
                    borderColor: isSelected ? '#fff' : markerColor,
                    boxShadow: isSelected ? `0 0 20px ${markerColor}cc` : 'none'
                  }}
                >
                  <MapPin className="w-4 h-4 fill-current" />
                </div>

                {isSelected && (
                  <motion.div 
                    layoutId="active-ring"
                    className="absolute -inset-1 rounded-full border animate-ping pointer-events-none"
                    style={{ borderColor: markerColor }}
                  />
                )}
              </motion.div>
            </Marker>
          );
        })}
      </Map>

      <AnimatePresence>
        {hoveredNeighborhood && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md border border-amber-400/30 rounded-full z-10 shadow-[0_0_30px_rgba(251,191,36,0.1)]"
          >
            <p className="text-amber-400 font-display text-sm tracking-widest uppercase font-medium">
              {hoveredNeighborhood}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-xl z-50">
          <div className="flex flex-col items-center gap-8">
            <div className="relative">
              <div className="w-20 h-20 border-2 border-amber-900 rounded-full" />
              <div className="absolute inset-0 border-t-2 border-amber-400 rounded-full animate-spin" />
              <div className="absolute inset-4 border-b-2 border-blue-500 rounded-full animate-reverse-spin" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-amber-400 text-lg font-display tracking-[0.4em] uppercase animate-pulse">Illuminating the City</h2>
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest">Scanning urban echoes...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
