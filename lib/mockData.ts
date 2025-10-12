// Mock data for local development (Phase 1)
// Will be replaced with Firebase in Phase 2

export interface Sighting {
  id: string;
  userId: string | null;
  imageUrl: string;
  thumbnailUrl: string;
  thingType: 'person' | 'animal' | 'object';
  thingDescription: string;
  latitude: number;
  longitude: number;
  locationVerified: boolean;
  textDescription: string;
  createdAt: Date;
  updatedAt: Date;
  isAnonymous: boolean;
}

// Mock sightings data
export const mockSightings: Sighting[] = [
  {
    id: '1',
    userId: null,
    imageUrl: 'https://via.placeholder.com/800x600?text=Suspicious+Person',
    thumbnailUrl: 'https://via.placeholder.com/200x150?text=Suspicious+Person',
    thingType: 'person',
    thingDescription: 'Person acting suspiciously near park',
    latitude: 37.7749,
    longitude: -122.4194,
    locationVerified: true,
    textDescription: 'Wearing dark hoodie, loitering around playground',
    createdAt: new Date('2025-01-10T10:30:00'),
    updatedAt: new Date('2025-01-10T10:30:00'),
    isAnonymous: true,
  },
  {
    id: '2',
    userId: null,
    imageUrl: 'https://via.placeholder.com/800x600?text=Stray+Animal',
    thumbnailUrl: 'https://via.placeholder.com/200x150?text=Stray+Animal',
    thingType: 'animal',
    thingDescription: 'Large aggressive dog roaming freely',
    latitude: 37.7849,
    longitude: -122.4094,
    locationVerified: true,
    textDescription: 'No collar, appears aggressive',
    createdAt: new Date('2025-01-10T11:15:00'),
    updatedAt: new Date('2025-01-10T11:15:00'),
    isAnonymous: true,
  },
  {
    id: '3',
    userId: null,
    imageUrl: 'https://via.placeholder.com/800x600?text=Abandoned+Object',
    thumbnailUrl: 'https://via.placeholder.com/200x150?text=Abandoned+Object',
    thingType: 'object',
    thingDescription: 'Unattended backpack at bus stop',
    latitude: 37.7649,
    longitude: -122.4294,
    locationVerified: true,
    textDescription: 'Black backpack, left alone for 30+ minutes',
    createdAt: new Date('2025-01-10T12:00:00'),
    updatedAt: new Date('2025-01-10T12:00:00'),
    isAnonymous: true,
  },
];

// In-memory storage for new sightings
let sightingsStore: Sighting[] = [...mockSightings];

export function getAllSightings(): Sighting[] {
  return [...sightingsStore].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getSightingById(id: string): Sighting | undefined {
  return sightingsStore.find(s => s.id === id);
}

export function createSighting(data: Omit<Sighting, 'id' | 'createdAt' | 'updatedAt'>): Sighting {
  const newSighting: Sighting = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  sightingsStore.push(newSighting);
  return newSighting;
}

export function updateSighting(id: string, data: Partial<Sighting>): Sighting | null {
  const index = sightingsStore.findIndex(s => s.id === id);
  if (index === -1) return null;

  sightingsStore[index] = {
    ...sightingsStore[index],
    ...data,
    updatedAt: new Date(),
  };
  return sightingsStore[index];
}

export function deleteSighting(id: string): boolean {
  const index = sightingsStore.findIndex(s => s.id === id);
  if (index === -1) return false;

  sightingsStore.splice(index, 1);
  return true;
}
