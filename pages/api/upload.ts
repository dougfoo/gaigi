import type { NextApiRequest, NextApiResponse } from 'next';

// Temporary mock upload endpoint
// In Phase 2, this will handle actual image uploads to Firebase Storage

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // TODO: In Phase 2, implement actual file upload to Firebase Storage
    // For now, just return a mock URL
    const mockImageUrl = `https://via.placeholder.com/800x600?text=Uploaded+Image+${Date.now()}`;
    const mockThumbnailUrl = `https://via.placeholder.com/200x150?text=Thumbnail+${Date.now()}`;

    return res.status(200).json({
      imageUrl: mockImageUrl,
      thumbnailUrl: mockThumbnailUrl,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
}
