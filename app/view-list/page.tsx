'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { type Sighting } from '@/lib/mockData';

export default function ViewList() {
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sightings')
      .then(res => res.json())
      .then(data => {
        setSightings(data.sightings || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching sightings:', error);
        setLoading(false);
      });
  }, []);

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

  return (
    <main className="min-h-screen p-4 max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to Home
        </Link>
        <h1 className="text-2xl font-bold">📋 View List</h1>
        <div className="w-20"></div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading sightings...</p>
        </div>
      ) : sightings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No sightings reported yet.</p>
          <Link href="/add-report" className="text-blue-600 hover:underline mt-2 inline-block">
            Add the first report
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sightings.map((sighting) => (
            <Link
              key={sighting.id}
              href={`/detail/${sighting.id}`}
              className="block bg-white rounded-lg border border-gray-300 hover:border-blue-500 hover:shadow-lg transition p-4"
            >
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  <img
                    src={sighting.thumbnailUrl}
                    alt={sighting.thingDescription}
                    className="w-32 h-24 object-cover rounded"
                  />
                </div>

                {/* Details */}
                <div className="flex-grow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className={`inline-block px-3 py-1 rounded text-xs font-semibold text-white ${getTypeBadgeColor(sighting.thingType)}`}>
                        {sighting.thingType.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(sighting.createdAt).toLocaleDateString()} {new Date(sighting.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <h3 className="font-semibold text-lg mb-1">{sighting.thingDescription}</h3>

                  {sighting.textDescription && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {sighting.textDescription}
                    </p>
                  )}

                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-4">📍 {sighting.latitude.toFixed(4)}, {sighting.longitude.toFixed(4)}</span>
                    {sighting.isAnonymous && <span className="text-xs bg-gray-200 px-2 py-1 rounded">Anonymous</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && sightings.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Total sightings: {sightings.length}
        </div>
      )}
    </main>
  );
}
