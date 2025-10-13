import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs/promises';
import vision from '@google-cloud/vision';

// Disable body parser for file upload
export const config = {
  api: {
    bodyParser: false,
  },
};

// Map Vision API labels to our sighting types
function mapLabelsToType(labels: string[]): 'people' | 'animals' | 'places' | 'vehicles' | 'trash' | 'bags' | 'objects' | null {
  const labelSet = new Set(labels.map(l => l.toLowerCase()));

  // Check for people
  const peopleKeywords = ['person', 'people', 'human', 'man', 'woman', 'child', 'face', 'portrait', 'crowd', 'group'];
  if (peopleKeywords.some(keyword => labelSet.has(keyword))) {
    return 'people';
  }

  // Check for animals
  const animalKeywords = ['animal', 'dog', 'cat', 'bird', 'pet', 'wildlife', 'mammal', 'fish', 'insect', 'reptile', 'horse', 'cow', 'deer'];
  if (animalKeywords.some(keyword => labelSet.has(keyword))) {
    return 'animals';
  }

  // Check for vehicles
  const vehicleKeywords = ['car', 'vehicle', 'truck', 'bus', 'motorcycle', 'bicycle', 'bike', 'van', 'automobile', 'transport', 'wheel', 'tire'];
  if (vehicleKeywords.some(keyword => labelSet.has(keyword))) {
    return 'vehicles';
  }

  // Check for places/buildings
  const placeKeywords = ['building', 'house', 'architecture', 'structure', 'real estate', 'property', 'landmark', 'monument', 'temple', 'church', 'tower', 'bridge'];
  if (placeKeywords.some(keyword => labelSet.has(keyword))) {
    return 'places';
  }

  // Check for trash/litter
  const trashKeywords = ['trash', 'garbage', 'litter', 'waste', 'rubbish', 'debris'];
  if (trashKeywords.some(keyword => labelSet.has(keyword))) {
    return 'trash';
  }

  // Check for bags/luggage
  const bagKeywords = ['bag', 'backpack', 'luggage', 'suitcase', 'handbag', 'purse', 'briefcase', 'duffle'];
  if (bagKeywords.some(keyword => labelSet.has(keyword))) {
    return 'bags';
  }

  // Default to objects
  return 'objects';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse form data
    const form = formidable({});
    const [fields, files] = await form.parse(req);

    const imageFile = files.image?.[0];
    if (!imageFile) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Read the file
    const fileBuffer = await fs.readFile(imageFile.filepath);

    // Initialize Vision API client
    const client = new vision.ImageAnnotatorClient();

    // Perform label detection
    console.log('Analyzing image with Vision API...');
    const [result] = await client.labelDetection({
      image: { content: fileBuffer },
    });

    const labels = result.labelAnnotations?.map(label => label.description || '') || [];
    console.log('Detected labels:', labels);

    // Map labels to our type
    const detectedType = mapLabelsToType(labels);
    console.log('Detected type:', detectedType);

    return res.status(200).json({
      detectedType,
      labels: labels.slice(0, 10), // Return top 10 labels for debugging
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    return res.status(500).json({ error: 'Failed to analyze image' });
  }
}
