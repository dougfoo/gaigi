import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllSightings, createSighting, type Sighting } from '@/lib/mockData';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get all sightings
    const sightings = getAllSightings();
    return res.status(200).json({ sightings });
  }

  if (req.method === 'POST') {
    // Create new sighting
    try {
      const data = req.body;

      // Validate required fields
      if (!data.imageUrl || !data.thingType || !data.latitude || !data.longitude) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newSighting = createSighting({
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
      });

      return res.status(201).json({ sighting: newSighting });
    } catch (error) {
      console.error('Error creating sighting:', error);
      return res.status(500).json({ error: 'Failed to create sighting' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
