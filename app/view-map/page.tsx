'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { type Sighting } from '@/lib/mockData';

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
        setSightings(data.sightings || []);
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
      case 'person':
        return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
      case 'animal':
        return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
      case 'object':
        return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
      default:
        return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    }
  };

  // Use a mock API key for development (will be replaced with env var in Phase 2)
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8';

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
                  icon={{
                    url: getMarkerIcon(sighting.thingType),
                    scaledSize: new window.google.maps.Size(32, 32),
                  }}
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
                      {new Date(selectedSighting.createdAt).toLocaleString()}
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
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span> Person
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span> Animal
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span> Object
          </div>
        </div>
      </div>
    </main>
  );
}
