import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs/promises';
import sharp from 'sharp';
import { generateImagePath } from '@/lib/storage';
import { adminStorage } from '@/lib/firebase-admin';

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

    // Generate storage paths
    const userId = fields.userId?.[0] || null;
    const fileName = imageFile.originalFilename || 'image.jpg';
    const imagePath = generateImagePath(userId, fileName);
    const thumbnailPath = generateImagePath(userId, `thumb_${fileName}`);

    // Upload original image using Admin SDK
    console.log('Uploading original image to Firebase Storage...');
    const bucket = adminStorage.bucket();
    const imageFile_ref = bucket.file(imagePath);
    await imageFile_ref.save(fileBuffer, {
      contentType: imageFile.mimetype || 'image/jpeg',
      metadata: {
        metadata: {
          uploadedBy: userId || 'anonymous',
        }
      }
    });
    await imageFile_ref.makePublic();
    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${imagePath}`;

    // Create and upload thumbnail using sharp
    console.log('Creating and uploading thumbnail...');
    const thumbnailBuffer = await sharp(fileBuffer)
      .resize(200, 150, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Upload thumbnail using Admin SDK
    const thumbnailFile_ref = bucket.file(thumbnailPath);
    await thumbnailFile_ref.save(thumbnailBuffer, {
      contentType: 'image/jpeg',
      metadata: {
        metadata: {
          uploadedBy: userId || 'anonymous',
          isThumbnail: 'true',
        }
      }
    });
    await thumbnailFile_ref.makePublic();
    const thumbnailUrl = `https://storage.googleapis.com/${bucket.name}/${thumbnailPath}`;

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
