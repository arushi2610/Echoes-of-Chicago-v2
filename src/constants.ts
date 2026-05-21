import { NeighborhoodLabel } from './types';

export const CHICAGO_CENTER = { lat: 41.8781, lng: -87.6298 };

export const NEIGHBORHOODS: NeighborhoodLabel[] = [
  { name: 'Wicker Park', coordinates: { lat: 41.9103, lng: -87.6742 } },
  { name: 'Pilsen', coordinates: { lat: 41.8561, lng: -87.6675 } },
  { name: 'Hyde Park', coordinates: { lat: 41.7943, lng: -87.5907 } },
  { name: 'Bridgeport', coordinates: { lat: 41.8364, lng: -87.6487 } },
  { name: 'Logan Square', coordinates: { lat: 41.9231, lng: -87.7093 } },
  { name: 'Lincoln Park', coordinates: { lat: 41.9214, lng: -87.6513 } },
  { name: 'South Loop', coordinates: { lat: 41.8654, lng: -87.6266 } },
];

export const LINE_COLORS: Record<string, string> = {
  RD: '#C60C30',
  BL: '#00A1DE',
  BR: '#62361B',
  GR: '#009B3A',
  OR: '#F9461C',
  PK: '#E27EA6',
  PR: '#522398',
  YL: '#F9E300',
  ML: '#000000', // Loop (Multiple Lines)
};

export const LINE_NAMES: Record<string, string> = {
  RD: 'Red Line',
  BL: 'Blue Line',
  BR: 'Brown Line',
  GR: 'Green Line',
  OR: 'Orange Line',
  PK: 'Pink Line',
  PR: 'Purple Line',
  YL: 'Yellow Line',
  ML: 'The Loop',
};

export const CTA_STATIONS_URL = 'https://data.cityofchicago.org/resource/8pix-ypme.geojson';
export const CTA_LINES_URL = 'https://data.cityofchicago.org/resource/xbyr-jnvx.geojson';
export const NEIGHBORHOODS_URL = 'https://data.cityofchicago.org/resource/igwz-8jzy.geojson';

export const STORY_CATEGORIES = [
  'Food',
  'Culture',
  'Childhood',
  'Music',
  'Student Life',
  'Nightlife',
  'Immigration',
  'Local History'
];

export const CHICAGO_COMMUNITY_AREAS = [
  "Albany Park", "Archer Heights", "Armour Square", "Ashburn", "Auburn Gresham", 
  "Austin", "Avalon Park", "Avondale", "Belmont Cragin", "Beverly", "Bridgeport", 
  "Brighton Park", "Burnside", "Calumet Heights", "Chatham", "Chicago Lawn", 
  "Clearing", "Douglas", "Dunning", "East Garfield Park", "East Side", 
  "Edgewater", "Edison Park", "Englewood", "Forest Glen", "Fuller Park", 
  "Gage Park", "Garfield Ridge", "Grand Boulevard", "Greater Grand Crossing", 
  "Hegewisch", "Hermosa", "Humboldt Park", "Hyde Park", "Irving Park", 
  "Jefferson Park", "Kenwood", "Lake View", "Lincoln Park", "Lincoln Square", 
  "Logan Square", "Loop", "Lower West Side", "McKinley Park", "Montclare", 
  "Morgan Park", "Mount Greenwood", "Near North Side", "Near South Side", 
  "Near West Side", "New City", "North Center", "North Lawndale", "North Park", 
  "Norwood Park", "Oakland", "O'Hare", "Portage Park", "Pullman", "Riverdale", 
  "Rogers Park", "Roseland", "South Chicago", "South Deering", "South Lawndale", 
  "South Shore", "Uptown", "Washington Heights", "Washington Park", "West Elsdon", 
  "West Englewood", "West Garfield Park", "West Lawn", "West Pullman", 
  "West Ridge", "West Town", "Woodlawn"
];
