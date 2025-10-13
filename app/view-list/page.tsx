'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { type Sighting } from '@/lib/firestore';

interface SightingWithAddress extends Sighting {
  address?: string;
}

export default function ViewList() {
  const [sightings, setSightings] = useState<SightingWithAddress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sightings')
      .then(res => res.json())
      .then(async (data) => {
        // Convert ISO string dates back to Date objects
        const sightings = (data.sightings || []).map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
        }));

        // Fetch addresses for all sightings
        const sightingsWithAddresses = await Promise.all(
          sightings.map(async (s: Sighting) => {
            try {
              const address = await reverseGeocode(s.latitude, s.longitude);
              console.log(address);
              return { ...s, address };
            } catch (error) {
              console.error('Error geocoding:', error);
              return { ...s, address: undefined };
            }
          })
        );

        setSightings(sightingsWithAddresses);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching sightings:', error);
        setLoading(false);
      });
  }, []);

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDMselEdH44QYeEjg1CIn0YuCnjiwjG-E0';
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=en`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const components = result.address_components;

        // Extract relevant components (exclude country and postal code)
        let street = '';
        let neighborhood = '';
        let locality = '';
        let city = '';
        let prefecture = '';

        components.forEach((comp: any) => {
          // Get street/route/premise for specific location
          if (comp.types.includes('route')) {
            if (!street) street = comp.long_name;
          } else if (comp.types.includes('premise') || comp.types.includes('street_address')) {
            if (!street) street = comp.long_name;
          }

          // Get neighborhood (sublocality_level_2 like "Shirokanedai")
          if (comp.types.includes('sublocality_level_2')) {
            neighborhood = comp.long_name;
          }

          // Get locality (city like "Minato City", "Karuizawa")
          if (comp.types.includes('locality')) {
            locality = comp.long_name;
          }

          // Get administrative_area_level_2 (usually district/county)
          if (comp.types.includes('administrative_area_level_2')) {
            if (!city) city = comp.long_name;
          }

          // Get prefecture (administrative_area_level_1)
          if (comp.types.includes('administrative_area_level_1')) {
            prefecture = comp.long_name;
          }
        });

        // Build short address prioritizing most specific info (never show GPS)
        // Format: "Street, Neighborhood" > "Neighborhood, Locality" > "Locality, Prefecture"
        if (street && neighborhood) {
          return `${street}, ${neighborhood}`;
        } else if (neighborhood && locality) {
          return `${neighborhood}, ${locality}`;
        } else if (locality && prefecture) {
          return `${locality}, ${prefecture}`;
        } else if (locality) {
          return locality;
        } else if (city && prefecture) {
          return `${city}, ${prefecture}`;
        } else if (prefecture) {
          return prefecture;
        } else if (neighborhood) {
          return neighborhood;
        } else if (city) {
          return city;
        }
        // If no address components found, return generic message
        return 'Address unavailable';
      }

      return 'Address unavailable';
    } catch (error) {
      return 'Address unavailable';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'people':
        return 'bg-red-500';
      case 'animals':
        return 'bg-yellow-500';
      case 'places':
        return 'bg-green-500';
      case 'vehicles':
        return 'bg-orange-500';
      case 'trash':
        return 'bg-amber-700';
      case 'bags':
        return 'bg-purple-500';
      case 'objects':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStaticMapUrl = (lat: number, lng: number) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDMselEdH44QYeEjg1CIn0YuCnjiwjG-E0';
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=128x96&markers=color:red%7C${lat},${lng}&key=${apiKey}`;
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
              <div className="flex flex-wrap gap-4">
                {/* Details - flex-grow allows it to take remaining space */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                    <div>
                      <span className={`inline-block px-3 py-1 rounded text-xs font-semibold text-white ${getTypeBadgeColor(sighting.thingType)}`}>
                        {sighting.thingType.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {(sighting.createdAt as Date).toLocaleDateString()} {(sighting.createdAt as Date).toLocaleTimeString()}
                    </span>
                  </div>

                  <h3 className="font-semibold text-lg mb-1 text-blue-900">{sighting.thingDescription}</h3>

                  {sighting.textDescription && (
                    <p className="text-amber-700 text-sm mb-2 line-clamp-2">
                      {sighting.textDescription}
                    </p>
                  )}

                  <div className="flex items-center text-sm text-gray-500 flex-wrap gap-2">
                    <span>📍 {sighting.address || 'Address unavailable'}</span>
                    {sighting.isAnonymous && <span className="text-xs bg-gray-200 px-2 py-1 rounded">Anonymous</span>}
                  </div>
                </div>

                {/* Images - thumbnail and map together */}
                <div className="flex gap-2 flex-shrink-0">
                  <img
                    src={sighting.thumbnailUrl}
                    alt={sighting.thingDescription}
                    className="w-32 h-24 object-cover rounded"
                  />
                  <img
                    src={getStaticMapUrl(sighting.latitude, sighting.longitude)}
                    alt="Location map"
                    className="w-32 h-24 object-cover rounded border border-gray-200"
                  />
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
