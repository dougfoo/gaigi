# Anonymous "Things" Tracking App - Project Plan

## Overview
A mobile-first web app for anonymous reporting and mapping of "things" (people, animals, objects) with photo uploads and geolocation.

## Architecture Overview

**Tech Stack:**
- **Frontend:** React.js PWA (Progressive Web App) - works on mobile browsers, installable optionally
- **Backend:** Express.js (Node.js)
- **Database:** Firebase Firestore (GCP, easy to deploy, no PostGIS setup needed)
- **Storage:** Google Cloud Storage for images
- **Maps:** Google Maps JavaScript API
- **Auth:** Google OAuth 2.0 (Firebase Auth)
- **Image Analysis:** Google Vision AI
- **Hosting:** Firebase Hosting (frontend) + Cloud Run (backend) or Firebase Functions

## Database Schema (Firestore)

```javascript
// Collection: users (optional, only if logged in)
users/{userId} {
  googleId: string,
  email: string,
  createdAt: timestamp
}

// Collection: sightings
sightings/{sightingId} {
  userId: string | null,           // null if anonymous
  imageUrl: string,
  thumbnailUrl: string,
  thingType: 'person' | 'animal' | 'object',
  thingDescription: string,        // AI-generated
  location: geopoint,               // Firestore geopoint type
  latitude: number,
  longitude: number,
  locationVerified: boolean,
  textDescription: string,          // user-provided text
  createdAt: timestamp,
  updatedAt: timestamp,
  isAnonymous: boolean
}

// Firestore geoqueries: Use geohash library for radius queries
```

## Key Features Implementation

### 1. Photo Upload Flow
- Extract EXIF GPS data from image → fallback to browser geolocation API → fallback to manual pin selection
- Send image to Vision AI for automatic classification
- Generate thumbnail for map markers
- Store original in cloud storage

### 2. Anonymous vs Authenticated
- Anonymous: no user_id, is_anonymous = true, no edit/delete capability
- Authenticated: link to user_id, can manage own posts

### 3. Map View
- Cluster markers when zoomed out
- Filter by thing_type
- Show thumbnail + description in info window
- Auto-center on user's location

## Project Structure

```
/gaigi
  /frontend (React PWA)
    /public
      manifest.json
      service-worker.js
    /src
      /components
        Map.jsx
        UploadForm.jsx
        SightingCard.jsx
        FilterBar.jsx
        Header.jsx
      /hooks
        useGeolocation.js
        useImageUpload.js
      /services
        api.js
        firebase.js
        maps.js
      /pages
        Home.jsx
        MySightings.jsx
        Upload.jsx
      App.jsx
      index.js
    package.json
    .env.local

  /backend (Express.js API)
    /routes
      sightings.js
      upload.js
    /services
      imageAnalysis.js
      storage.js
      geolocation.js
    /middleware
      auth.js
    server.js
    package.json
    .env

  firebase.json
  .firebaserc
```

## Customer Journey

1. **Anonymous Upload:**
   - User opens app
   - Takes/selects photo
   - App auto-detects thing type (person/animal/object)
   - App extracts GPS from photo EXIF or uses device location
   - User can verify/adjust location on map
   - User adds optional text description
   - Photo uploaded anonymously

2. **Authenticated User:**
   - User logs in with Google
   - Can see "My Uploads" section
   - Can edit/delete own sightings
   - Same upload flow as anonymous

3. **Map Viewing:**
   - Users see map of local area
   - Markers show sightings with thumbnails
   - Filter by thing type (person/animal/object)
   - Click marker to see full photo + details

## Development Plan

### Phase 1: Local Setup
1. Initialize React app with Create React App
2. Set up Express backend server
3. Configure Firebase project (Firestore, Auth, Storage)
4. Set up local environment variables

### Phase 2: Core Features
5. Implement image upload with EXIF extraction
6. Build Google Vision AI integration for auto-classification
7. Create map interface with Google Maps API
8. Build upload form with location selection
9. Implement Firestore queries with geohashing

### Phase 3: Authentication
10. Add Google OAuth with Firebase Auth
11. Implement user dashboard (My Uploads)
12. Add edit/delete functionality for authenticated users

### Phase 4: Polish
13. Add PWA capabilities (manifest, service worker)
14. Implement marker clustering on map
15. Add filtering UI
16. Optimize images (thumbnails)

### Phase 5: Deployment
17. Deploy backend to Cloud Run
18. Deploy frontend to Firebase Hosting
19. Set up environment variables in GCP
20. Test production build

## Environment Setup Required

- Node.js & npm
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud SDK (gcloud CLI)
- Firebase project created in GCP
- Google Maps API key
- Google Vision API enabled
