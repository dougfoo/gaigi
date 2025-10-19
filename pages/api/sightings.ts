import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllSightings, createSighting } from '@/lib/firestore';
import { adminDb } from '@/lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get all sightings
    try {
      const sightings = await getAllSightings();
      // Convert Date objects to ISO strings for JSON serialization
      const serializedSightings = sightings.map(s => ({
        ...s,
        createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
        updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : s.updatedAt,
      }));
      return res.status(200).json({ sightings: serializedSightings });
    } catch (error) {
      console.error('Error fetching sightings:', error);
      return res.status(500).json({ error: 'Failed to fetch sightings' });
    }
  }

  if (req.method === 'POST') {
    // Create new sighting
    try {
      const data = req.body;

      // Validate required fields
      if (!data.imageUrl || !data.thingType || !data.latitude || !data.longitude) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const sightingId = await createSighting({
        userId: data.userId || null,
        imageUrl: data.imageUrl,
        thumbnailUrl: data.thumbnailUrl || data.imageUrl,
        thingType: data.thingType,
        thingDescription: data.thingDescription || '',
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        locationVerified: data.locationVerified || false,
        textDescription: data.textDescription || '',
        isAnonymous: data.userId ? false : true,
      } as any);

      // Also enqueue an email by adding a document to the "mail" collection
      // This uses the Firebase Admin SDK so it runs server-side with proper privileges.
      try {
        await adminDb.collection('mail').add({
          to: 'doug.cha@gmail.com',
          message: {
            subject: 'New GaiGi entry (1.2) !',
            html: `Someone entered a <b>new</b> entry.<br/>Type: ${data.thingType ?? ''}<br/>Description: ${data.textDescription ?? ''}`,
          },
        });
      } catch (mailError) {
        // Do not fail the main request if email queueing fails; just log it
        console.error('Failed to enqueue email notification:', mailError);
      }

      return res.status(201).json({ id: sightingId, success: true });
    } catch (error) {
      console.error('Error creating sighting:', error);
      return res.status(500).json({ error: 'Failed to create sighting' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
