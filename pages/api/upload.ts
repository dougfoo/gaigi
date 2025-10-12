import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs/promises';
import { uploadImage, generateImagePath, createThumbnail } from '@/lib/storage';

// Disable body parser for file upload
export const config = {
  api: {
    bodyParser: false,
  },
};

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
    const file = new File([fileBuffer], imageFile.originalFilename || 'image.jpg', {
      type: imageFile.mimetype || 'image/jpeg',
    });

    // Generate storage paths
    const userId = fields.userId?.[0] || null;
    const imagePath = generateImagePath(userId, file.name);
    const thumbnailPath = generateImagePath(userId, `thumb_${file.name}`);

    // Upload original image
    console.log('Uploading original image to Firebase Storage...');
    const imageUrl = await uploadImage(file, imagePath);

    // Create and upload thumbnail
    console.log('Creating and uploading thumbnail...');
    const thumbnailBlob = await createThumbnail(file);
    const thumbnailFile = new File([thumbnailBlob], `thumb_${file.name}`, {
      type: 'image/jpeg',
    });
    const thumbnailUrl = await uploadImage(thumbnailFile, thumbnailPath);

    console.log('Upload successful!', { imageUrl, thumbnailUrl });

    return res.status(200).json({
      imageUrl,
      thumbnailUrl,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
}
