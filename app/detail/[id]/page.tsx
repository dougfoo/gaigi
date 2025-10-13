'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { type Sighting } from '@/lib/firestore';

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [sighting, setSighting] = useState<Sighting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sightings')
      .then(res => res.json())
      .then(data => {
        // Convert ISO string dates back to Date objects
        const sightings = (data.sightings || []).map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
        }));
        const found = sightings.find((s: Sighting) => s.id === id);
        setSighting(found || null);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching sighting:', error);
        setLoading(false);
      });
  }, [id]);

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'person':
        return 'bg-red-500';
      case 'animal':
        return 'bg-yellow-500';
      case 'object':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-4 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      </main>
    );
  }

  if (!sighting) {
    return (
      <main className="min-h-screen p-4 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Sighting not found</p>
          <Link href="/view-list" className="text-blue-600 hover:underline">
            ← Back to List
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline"
        >
          ← Back
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
        {/* Large Photo */}
        <div className="w-full">
          <img
            src={sighting.imageUrl}
            alt={sighting.thingDescription}
            className="w-full h-auto max-h-96 object-contain bg-gray-100"
          />
        </div>

        {/* Details Section */}
        <div className="p-6">
          {/* Type Badge */}
          <div className="mb-4">
            <span className={`inline-block px-4 py-2 rounded text-sm font-semibold text-white ${getTypeBadgeColor(sighting.thingType)}`}>
              {sighting.thingType.toUpperCase()}
            </span>
          </div>

          {/* Description */}
          <h1 className="text-2xl font-bold mb-2 text-blue-900">{sighting.thingDescription}</h1>

          {sighting.textDescription && (
            <p className="text-gray-700 mb-6">{sighting.textDescription}</p>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Location</p>
              <p className="font-semibold">
                📍 {sighting.latitude.toFixed(6)}, {sighting.longitude.toFixed(6)}
              </p>
              {sighting.locationVerified && (
                <p className="text-xs text-green-600 mt-1">✓ Location verified</p>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Reported</p>
              <p className="font-semibold">
                {(sighting.createdAt as Date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                {(sighting.createdAt as Date).toLocaleTimeString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <p className="font-semibold">
                {sighting.isAnonymous ? '🔒 Anonymous' : '👤 User Report'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Last Updated</p>
              <p className="font-semibold">
                {(sighting.updatedAt as Date).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6 pt-4 border-t">
            <Link
              href={`https://www.google.com/maps?q=${sighting.latitude},${sighting.longitude}`}
              target="_blank"
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition text-center"
            >
              🗺️ View on Google Maps
            </Link>
            <Link
              href="/view-list"
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition text-center"
            >
              View All
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
