'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { type Sighting } from '@/lib/firestore';

const mapContainerStyle = {
  width: '100%',
  height: 'calc(100vh - 120px)',
};

const defaultCenter = {
  lat: 37.7749, // San Francisco
  lng: -122.4194,
};

export default function ViewMap() {
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch sightings
    fetch('/api/sightings')
      .then(res => res.json())
      .then(data => {
        // Convert ISO string dates back to Date objects
        const sightings = (data.sightings || []).map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
        }));
        setSightings(sightings);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching sightings:', error);
        setLoading(false);
      });

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'people':
        return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
      case 'animals':
        return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
      case 'places':
        return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
      case 'vehicles':
        return 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
      case 'trash':
        return 'http://maps.google.com/mapfiles/ms/icons/brown-dot.png';
      case 'bags':
        return 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';
      case 'objects':
        return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
      default:
        return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    }
  };

  // Google Maps API key
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDMselEdH44QYeEjg1CIn0YuCnjiwjG-E0';

  return (
    <main className="min-h-screen p-4">
      <div className="mb-4 flex justify-between items-center">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to Home
        </Link>
        <h1 className="text-2xl font-bold">🗺️ View Map</h1>
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>

      <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <p className="text-gray-500">Loading map...</p>
          </div>
        ) : (
          <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={13}
            >
              {sightings.map((sighting) => (
                <Marker
                  key={sighting.id}
                  position={{ lat: sighting.latitude, lng: sighting.longitude }}
                  icon={getMarkerIcon(sighting.thingType)}
                  onClick={() => setSelectedSighting(sighting)}
                />
              ))}

              {selectedSighting && (
                <InfoWindow
                  position={{
                    lat: selectedSighting.latitude,
                    lng: selectedSighting.longitude,
                  }}
                  onCloseClick={() => setSelectedSighting(null)}
                >
                  <div className="p-2 max-w-xs">
                    <img
                      src={selectedSighting.thumbnailUrl}
                      alt={selectedSighting.thingDescription}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                    <div className="mb-1">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold text-white ${
                        selectedSighting.thingType === 'person' ? 'bg-red-500' :
                        selectedSighting.thingType === 'animal' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}>
                        {selectedSighting.thingType.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm font-semibold mb-1">{selectedSighting.thingDescription}</p>
                    {selectedSighting.textDescription && (
                      <p className="text-xs text-gray-600 mb-2">{selectedSighting.textDescription}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {(selectedSighting.createdAt as Date).toLocaleString()}
                    </p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        )}
      </div>

      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
        <p className="text-sm font-semibold mb-2">Legend:</p>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span> People
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span> Animals
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span> Places
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-orange-500 rounded-full"></span> Vehicles
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-amber-700 rounded-full"></span> Trash
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-purple-500 rounded-full"></span> Bags
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span> Objects
          </div>
        </div>
      </div>
    </main>
  );
}
