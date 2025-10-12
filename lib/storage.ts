import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload an image file to Firebase Storage
 * @param file - The image file to upload
 * @param path - The storage path (e.g., 'sightings/user123/timestamp-filename.jpg')
 * @returns The download URL of the uploaded image
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

/**
 * Upload a blob to Firebase Storage
 * @param blob - The blob to upload
 * @param path - The storage path
 * @returns The download URL of the uploaded blob
 */
export async function uploadImageFromBlob(blob: Blob, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, blob);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

/**
 * Generate a unique storage path for an image
 * @param userId - The user ID (or null for anonymous)
 * @param filename - The original filename
 * @returns A unique storage path
 */
export function generateImagePath(userId: string | null, filename: string): string {
  const timestamp = Date.now();
  const userPath = userId || 'anonymous';
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `sightings/${userPath}/${timestamp}-${sanitizedFilename}`;
}

/**
 * Create a thumbnail from an image file
 * @param file - The original image file
 * @param maxWidth - Maximum width of thumbnail (default 200px)
 * @param maxHeight - Maximum height of thumbnail (default 150px)
 * @returns A promise that resolves to a Blob containing the thumbnail
 */
export async function createThumbnail(
  file: File,
  maxWidth: number = 200,
  maxHeight: number = 150
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create thumbnail blob'));
          }
        },
        'image/jpeg',
        0.8 // Quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}
