import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // In Cloud Run, use Application Default Credentials
  // Locally, you would need GOOGLE_APPLICATION_CREDENTIALS env var
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'gaigi-1f735.firebasestorage.app',
    });
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    // Fallback initialization with project ID
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'gaigi-1f735',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'gaigi-1f735.firebasestorage.app',
    });
  }
}

export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
export default admin;
