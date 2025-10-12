import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadImage(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

export async function uploadImageFromBlob(blob: Blob, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, blob);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

export function generateImagePath(userId: string | null, filename: string): string {
  const timestamp = Date.now();
  const userPath = userId || 'anonymous';
  return `sightings/${userPath}/${timestamp}-${filename}`;
}
