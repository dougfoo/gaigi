'use client';

import { useState } from 'react';
import { getVersionString, getFullVersionString, getBuildDate, getRecentChanges } from '@/lib/version';

export default function Home() {
  const [showAbout, setShowAbout] = useState(false);

  const handleLoginClick = () => {
    alert('Coming soon');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">🚨 GaiGi 外疑</h1>
        <p className="text-gray-600">Report Suspicious Things</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <a
          href="/add-report"
          className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition text-center"
        >
          📷 Add Report
        </a>

        <a
          href="/view-map"
          className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition text-center"
        >
          🗺️ View Map
        </a>

        <a
          href="/view-list"
          className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition text-center"
        >
          📋 View List
        </a>
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={handleLoginClick}
          className="text-gray-600 hover:text-gray-900 underline"
        >
          Login
        </button>
        <button
          onClick={() => setShowAbout(true)}
          className="text-gray-600 hover:text-gray-900 underline"
        >
          About
        </button>
      </div>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowAbout(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">About GaiGi</h2>
              <button
                onClick={() => setShowAbout(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Version {getVersionString()}</p>
                <p className="text-xs text-gray-500">Build: {getFullVersionString()}</p>
                <p className="text-sm text-gray-600 mt-1">Released: {getBuildDate()}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Recent Changes</h3>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  {getRecentChanges().map((change, index) => (
                    <li key={index} className="text-xs leading-relaxed">{change}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Coming Soon</h3>
                <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                  <li>User authentication with Google OAuth</li>
                  <li>AI-powered auto-detection of objects</li>
                  <li>Advanced filtering and search</li>
                  <li>Map marker clustering</li>
                </ul>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">
                  GaiGi is a mobile-first web application for reporting and tracking suspicious sightings.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
