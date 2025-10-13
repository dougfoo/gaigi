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
    thingType: '' as 'people' | 'animals' | 'places' | 'vehicles' | 'trash' | 'bags' | 'objects' | '',
    address: '',
    latitude: '',
    longitude: '',
    textDescription: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationSource, setLocationSource] = useState<'exif' | 'browser' | 'manual'>('manual');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Reverse geocode: lat/lng -> address
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDMselEdH44QYeEjg1CIn0YuCnjiwjG-E0';
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=en`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        const components = result.address_components;

        let street = '';
        let neighborhood = '';
        let locality = '';
        let prefecture = '';

        components.forEach((comp: any) => {
          if (comp.types.includes('route')) {
            if (!street) street = comp.long_name;
          } else if (comp.types.includes('premise') || comp.types.includes('street_address')) {
            if (!street) street = comp.long_name;
          }
          if (comp.types.includes('sublocality_level_2')) {
            neighborhood = comp.long_name;
          }
          if (comp.types.includes('locality')) {
            locality = comp.long_name;
          }
          if (comp.types.includes('administrative_area_level_1')) {
            prefecture = comp.long_name;
          }
        });

        if (street && neighborhood) {
          return `${street}, ${neighborhood}, ${prefecture}`;
        } else if (neighborhood && locality) {
          return `${neighborhood}, ${locality}, ${prefecture}`;
        } else if (locality && prefecture) {
          return `${locality}, ${prefecture}`;
        } else if (prefecture) {
          return prefecture;
        }
      }
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  // Forward geocode: address -> lat/lng
  const forwardGeocode = async (address: string): Promise<{lat: number, lng: number} | null> => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDMselEdH44QYeEjg1CIn0YuCnjiwjG-E0';
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return { lat: location.lat, lng: location.lng };
      }
      return null;
    } catch (error) {
      console.error('Forward geocoding error:', error);
      return null;
    }
  };

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
        const lat = exifData.latitude;
        const lng = exifData.longitude;
        const address = await reverseGeocode(lat, lng);

        setFormData(prev => ({
          ...prev,
          address,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
        }));
        setLocationSource('exif');
        console.log('Location extracted from photo EXIF data');
      } else {
        // Fallback to browser geolocation
        try {
          const browserLocation = await getBrowserLocation();
          const address = await reverseGeocode(browserLocation.latitude, browserLocation.longitude);

          setFormData(prev => ({
            ...prev,
            address,
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
        const address = await reverseGeocode(browserLocation.latitude, browserLocation.longitude);

        setFormData(prev => ({
          ...prev,
          address,
          latitude: browserLocation.latitude.toFixed(6),
          longitude: browserLocation.longitude.toFixed(6),
        }));
        setLocationSource('browser');
      } catch (error) {
        console.error('Error getting browser location:', error);
        setLocationSource('manual');
      }
    }

    // Auto-detect thing type with Vision AI
    setIsAnalyzing(true);
    try {
      const formDataAnalyze = new FormData();
      formDataAnalyze.append('image', file);

      const analyzeRes = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formDataAnalyze,
      });

      if (analyzeRes.ok) {
        const { detectedType, labels } = await analyzeRes.json();
        console.log('Vision API detected type:', detectedType, 'Labels:', labels);

        if (detectedType) {
          setFormData(prev => ({
            ...prev,
            thingType: detectedType,
          }));
        }
      } else {
        console.error('Vision API analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !formData.thingType || !formData.address) {
      alert('Please fill in all required fields (photo, type, address)');
      return;
    }

    // If user edited the address, we need to forward geocode it to get lat/lng
    let finalLat = formData.latitude;
    let finalLng = formData.longitude;

    if (!finalLat || !finalLng) {
      // Forward geocode the address
      const coords = await forwardGeocode(formData.address);
      if (!coords) {
        alert('Could not find coordinates for this address. Please enter a valid address.');
        return;
      }
      finalLat = coords.lat.toString();
      finalLng = coords.lng.toString();
    }

    setIsSubmitting(true);

    try {
      // Step 1: Upload image to Firebase Storage
      const formDataUpload = new FormData();
      formDataUpload.append('image', selectedFile);
      formDataUpload.append('userId', 'null'); // Anonymous for now

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const { imageUrl, thumbnailUrl } = await uploadRes.json();
      console.log('Image uploaded successfully:', { imageUrl, thumbnailUrl });

      // Step 2: Create sighting
      const sightingRes = await fetch('/api/sightings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          thumbnailUrl,
          thingType: formData.thingType,
          thingDescription: `Auto-detected: ${formData.thingType}`,
          latitude: finalLat,
          longitude: finalLng,
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
                id="photo-camera"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="photo-gallery"
              />
              <div className="flex gap-3 justify-center flex-wrap">
                <label
                  htmlFor="photo-camera"
                  className="cursor-pointer inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  📷 Take Photo
                </label>
                <label
                  htmlFor="photo-gallery"
                  className="cursor-pointer inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                >
                  🖼️ Choose from Gallery
                </label>
              </div>
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
            disabled={isAnalyzing}
            required
          >
            <option value="">{isAnalyzing ? '🔍 Auto-detecting...' : 'Select type...'}</option>
            <option value="people">👥 People</option>
            <option value="animals">🐾 Animals</option>
            <option value="places">🏢 Places</option>
            <option value="vehicles">🚗 Vehicles</option>
            <option value="trash">🗑️ Trash</option>
            <option value="bags">🎒 Bags</option>
            <option value="objects">📦 Objects</option>
          </select>
          {isAnalyzing && (
            <p className="text-sm text-blue-600 mt-1">🤖 Analyzing image with AI...</p>
          )}
          {formData.thingType && !isAnalyzing && (
            <p className="text-sm text-green-600 mt-1">✓ Type detected (you can change if needed)</p>
          )}
        </div>

        {/* Location Address */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Address (auto-filled if possible) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-black"
            placeholder="e.g., Shirokanedai, Minato City, Tokyo"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            {locationSource === 'exif' && '📷 Address from photo GPS data (editable)'}
            {locationSource === 'browser' && '📍 Address from your device location (editable)'}
            {locationSource === 'manual' && 'Enter address manually or upload a photo with GPS data'}
          </p>
        </div>

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
