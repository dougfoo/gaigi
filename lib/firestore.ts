import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  GeoPoint
} from 'firebase/firestore';
import { db } from './firebase';

export interface Sighting {
  id?: string;
  userId: string | null;
  imageUrl: string;
  thumbnailUrl: string;
  thingType: 'person' | 'animal' | 'object';
  thingDescription: string;
  location: GeoPoint;
  latitude: number;
  longitude: number;
  locationVerified: boolean;
  textDescription: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  isAnonymous: boolean;
}

const SIGHTINGS_COLLECTION = 'sightings';

export async function createSighting(data: Omit<Sighting, 'id' | 'createdAt' | 'updatedAt'>) {
  const docRef = await addDoc(collection(db, SIGHTINGS_COLLECTION), {
    ...data,
    location: new GeoPoint(data.latitude, data.longitude),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getSighting(id: string): Promise<Sighting | null> {
  const docRef = doc(db, SIGHTINGS_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Sighting;
  }
  return null;
}

export async function getAllSightings(): Promise<Sighting[]> {
  const q = query(collection(db, SIGHTINGS_COLLECTION), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Sighting;
  });
}

export async function updateSighting(id: string, data: Partial<Sighting>) {
  const docRef = doc(db, SIGHTINGS_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteSighting(id: string) {
  const docRef = doc(db, SIGHTINGS_COLLECTION, id);
  await deleteDoc(docRef);
}
