'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { extractExifData, getBrowserLocation } from '@/lib/exif';

export default function AddReport() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    thingType: '' as 'person' | 'animal' | 'object' | '',
    latitude: '',
    longitude: '',
    textDescription: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationSource, setLocationSource] = useState<'exif' | 'browser' | 'manual'>('manual');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Extract EXIF data from the image
    try {
      const exifData = await extractExifData(file);

      if (exifData.hasGPS && exifData.latitude && exifData.longitude) {
        // Use GPS data from photo EXIF
        setFormData(prev => ({
          ...prev,
          latitude: exifData.latitude!.toFixed(6),
          longitude: exifData.longitude!.toFixed(6),
        }));
        setLocationSource('exif');
        console.log('Location extracted from photo EXIF data');
      } else {
        // Fallback to browser geolocation
        try {
          const browserLocation = await getBrowserLocation();
          setFormData(prev => ({
            ...prev,
            latitude: browserLocation.latitude.toFixed(6),
            longitude: browserLocation.longitude.toFixed(6),
          }));
          setLocationSource('browser');
          console.log('Location obtained from browser geolocation');
        } catch (error) {
          console.error('Error getting browser location:', error);
          setLocationSource('manual');
        }
      }
    } catch (error) {
      console.error('Error extracting EXIF data:', error);
      // Try browser geolocation as fallback
      try {
        const browserLocation = await getBrowserLocation();
        setFormData(prev => ({
          ...prev,
          latitude: browserLocation.latitude.toFixed(6),
          longitude: browserLocation.longitude.toFixed(6),
        }));
        setLocationSource('browser');
      } catch (error) {
        console.error('Error getting browser location:', error);
        setLocationSource('manual');
      }
    }

    // TODO: Auto-detect thing type with Vision AI
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !formData.thingType || !formData.latitude || !formData.longitude) {
      alert('Please fill in all required fields (photo, type, location)');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Upload image (mock for now)
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: selectedFile.name }),
      });

      if (!uploadRes.ok) throw new Error('Upload failed');

      const { imageUrl, thumbnailUrl } = await uploadRes.json();

      // Step 2: Create sighting
      const sightingRes = await fetch('/api/sightings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          thumbnailUrl,
          thingType: formData.thingType,
          thingDescription: `Auto-detected: ${formData.thingType}`,
          latitude: formData.latitude,
          longitude: formData.longitude,
          locationVerified: true,
          textDescription: formData.textDescription,
          userId: null, // Anonymous for now
        }),
      });

      if (!sightingRes.ok) throw new Error('Failed to create sighting');

      alert('Report submitted successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to Home
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">📷 Add Report</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Photo <span className="text-red-500">*</span>
          </label>

          {!imagePreview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
                id="photo-input"
              />
              <label
                htmlFor="photo-input"
                className="cursor-pointer inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                📷 Take/Select Photo
              </label>
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setImagePreview(null);
                }}
                className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                ✕ Remove
              </button>
            </div>
          )}
        </div>

        {/* Thing Type */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.thingType}
            onChange={(e) => setFormData({ ...formData, thingType: e.target.value as any })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-black"
            required
          >
            <option value="">Select type...</option>
            <option value="person">Person</option>
            <option value="animal">Animal</option>
            <option value="object">Object</option>
          </select>
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Latitude <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-black"
              placeholder="37.7749"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Longitude <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-black"
              placeholder="-122.4194"
              required
            />
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {locationSource === 'exif' && '📷 Location extracted from photo GPS data'}
          {locationSource === 'browser' && '📍 Location detected from your device'}
          {locationSource === 'manual' && 'Enter location manually or allow location access'}
        </p>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Description (Optional)
          </label>
          <textarea
            value={formData.textDescription}
            onChange={(e) => setFormData({ ...formData, textDescription: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-black"
            rows={4}
            placeholder="Add any additional details..."
          />
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
