import exifr from 'exifr';

export interface ExifData {
  latitude?: number;
  longitude?: number;
  timestamp?: Date;
  hasGPS: boolean;
}

/**
 * Extract EXIF data from an image file
 * @param file - The image file to extract EXIF data from
 * @returns Promise with extracted EXIF data
 */
export async function extractExifData(file: File): Promise<ExifData> {
  try {
    // Parse EXIF data from the image
    const exif = await exifr.parse(file, {
      gps: true,
      pick: ['latitude', 'longitude', 'DateTimeOriginal', 'CreateDate'],
    });

    if (!exif) {
      return { hasGPS: false };
    }

    // Extract GPS coordinates
    const latitude = exif.latitude;
    const longitude = exif.longitude;

    // Extract timestamp
    let timestamp: Date | undefined;
    if (exif.DateTimeOriginal) {
      timestamp = new Date(exif.DateTimeOriginal);
    } else if (exif.CreateDate) {
      timestamp = new Date(exif.CreateDate);
    }

    return {
      latitude,
      longitude,
      timestamp,
      hasGPS: !!(latitude && longitude),
    };
  } catch (error) {
    console.error('Error extracting EXIF data:', error);
    return { hasGPS: false };
  }
}

/**
 * Get location from browser geolocation API
 * @returns Promise with latitude and longitude
 */
export function getBrowserLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
}
