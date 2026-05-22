export interface Memory {
  id: string;
  title: string;
  story: string;
  neighborhood: string;
  era: string;
  category: string;
  author: string;
  authorId: string;
  timestamp: string;
  coordinates: [number, number]; // [lat, lng]
  isUnlocked: boolean;
  address?: string;
  imageUrl?: string;
  audioUrl?: string;
  reactions?: number;
}

export interface NeighborhoodFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: any;
  };
  properties: {
    community: string;
    area_numbe: string;
  };
}

export interface NeighborhoodLabel {
  name: string;
  coordinates: { lat: number; lng: number };
}

export type LineColor = 'red' | 'blue' | 'brown' | 'green' | 'orange' | 'pink' | 'purple' | 'yellow';

export interface StationProperties {
  station_name: string;
  station_descriptive_name: string;
  stop_id: string;
  ada: boolean;
  red: boolean;
  blue: boolean;
  g: boolean; // green
  brn: boolean; // brown
  p: boolean; // purple
  pnk: boolean; // pink
  o: boolean; // orange
  y: boolean; // yellow
  location_address?: string;
  location_city?: string;
  location_zip?: string;
}

export interface StationFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: StationProperties;
}

export interface RailLineProperties {
  lines: string;
  description: string;
  type: string;
  legend: string;
  shape_len: string;
}

export interface RailLineFeature {
  type: 'Feature';
  geometry: {
    type: 'LineString' | 'MultiLineString';
    coordinates: any;
  };
  properties: RailLineProperties;
}
