# Anonymous "Things" Tracking App - Project Plan

## Overview
A mobile-first web app for anonymous reporting and mapping of "things" (people, animals, objects) with photo uploads and geolocation.

## Architecture Overview

**Tech Stack:**
- **Framework:** Next.js (React framework with built-in API routes)
- **Database:** Firebase Firestore (GCP, easy to deploy, no PostGIS setup needed)
- **Storage:** Firebase Storage (Google Cloud Storage)
- **Maps:** Google Maps JavaScript API
- **Auth:** Google OAuth 2.0 (Firebase Auth)
- **Image Analysis:** Google Vision AI
- **Hosting:** Vercel (easiest for Next.js) or Firebase Hosting
- **PWA:** Next.js PWA plugin for Progressive Web App capabilities

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
  /pages
    /api                    # Backend API routes
      sightings.js          # GET all sightings
      /sightings
        [id].js             # GET/PUT/DELETE specific sighting
      upload.js             # POST image upload & create sighting
    index.js                # Home page (3 buttons)
    add-report.js           # Add report page (photo + form)
    view-map.js             # Map view page
    view-list.js            # List/table view page
    detail/[id].js          # Detail view page
    _app.js                 # Next.js app wrapper

  /components
    Header.jsx              # Header with login/logout button
    Layout.jsx              # Page layout wrapper
    MapView.jsx             # Google Maps component with markers
    SightingList.jsx        # Table/list of sightings
    SightingDetail.jsx      # Detail view component
    ReportForm.jsx          # Photo upload + metadata form
    LocationPicker.jsx      # Map-based location picker

  /lib
    firebase.js             # Firebase initialization
    firestore.js            # Firestore helpers
    storage.js              # Firebase Storage helpers
    visionAI.js             # Google Vision AI integration
    geolocation.js          # Location utilities

  /hooks
    useGeolocation.js       # Geolocation hook
    useAuth.js              # Firebase auth hook

  /public
    manifest.json           # PWA manifest
    icons/                  # App icons

  /styles
    globals.css
    Home.module.css

  next.config.js            # Next.js configuration
  package.json
  .env.local                # Environment variables
```

## UI Design (Simple & Minimal)

### Home Page (Landing)
```
┌─────────────────────────────────┐
│  [Login/Logout]                 │
├─────────────────────────────────┤
│                                 │
│     🚨 GAIGI                    │
│     Report Suspicious Things    │
│                                 │
│  [ 📷 Add Report ]              │
│                                 │
│  [ 🗺️  View Map ]               │
│                                 │
│  [ 📋 View List ]               │
│                                 │
└─────────────────────────────────┘
```

### Add Report Flow
1. Click "Add Report" → Camera/Photo picker opens
2. Take/select photo
3. Form appears with:
   - **Location:** Auto-detected (can override with map picker) - REQUIRED
   - **Type:** Auto-detected dropdown (person/animal/object) - REQUIRED
   - **Description:** Text field - OPTIONAL
4. Submit → Returns to home

### View Map Page
- Google Map with markers for all sightings
- Click marker → Shows detail popup (photo + metadata)
- Back button to home

### View List Page
- Table/List view sorted by most recent
- Shows: thumbnail, type, location, date, description snippet
- Click row → Detail view
- Back button to home

### Detail View
- Large photo
- Type badge
- Location (lat/long or address)
- Description
- Timestamp
- Back button

## Customer Journey

1. **Anonymous User:**
   - Opens app → sees 3 buttons (Add Report, View Map, View List)
   - Click "Add Report" → take photo → fill form → submit
   - Click "View Map" → see all sightings on map → click marker for details
   - Click "View List" → see table of sightings → click row for details

2. **Authenticated User (after login):**
   - Same as anonymous
   - Can edit/delete own reports from detail view
   - "Logout" button visible in header

## Development Plan

### Phase 1: Local Setup
1. Initialize Next.js app with `create-next-app`
2. Install and configure Firebase SDK (Firestore, Auth, Storage)
3. Set up Next.js PWA plugin
4. Configure environment variables (.env.local)
5. Set up Firebase project in GCP console

### Phase 2: Core Features
6. Create Firebase initialization and helper utilities
7. Build API route: `/api/upload` with EXIF extraction
8. Integrate Google Vision AI for image classification
9. Build API route: `/api/sightings` (GET/POST)
10. Create home page with Google Maps component
11. Implement geohashing for Firestore location queries
12. Build upload form with location selection

### Phase 3: Authentication
13. Add Firebase Auth with Google OAuth
14. Create auth context and useAuth hook
15. Build "My Uploads" page
16. Add API routes for update/delete with auth middleware
17. Implement edit/delete functionality

### Phase 4: Polish
18. Add PWA manifest and icons
19. Implement marker clustering on map
20. Build filter UI for thing types
21. Add image optimization (Next.js Image + thumbnails)
22. Add loading states and error handling
23. Make responsive for mobile

### Phase 5: Deployment
24. Deploy to Vercel (one-click deployment)
25. Configure environment variables in Vercel
26. Set up Firebase security rules
27. Test production build on mobile
28. Configure custom domain (optional)

## Environment Setup Required

- Node.js & npm (v18+ recommended)
- Firebase project created in GCP console
- Google Maps API key (with Maps JavaScript API enabled)
- Google Vision API enabled in GCP
- Vercel account (for deployment)

## Key Dependencies

```json
{
  "next": "^14.x",
  "react": "^18.x",
  "firebase": "^10.x",
  "next-pwa": "^5.x",
  "@react-google-maps/api": "^2.x",
  "exifr": "^7.x",
  "geohash": "^0.x"
}
```
