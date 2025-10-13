# Phase 2 Implementation Plan: Enhanced Types, Auto-Detection & Address Input

## Feature 1: Expand Types (people, animals, places, vehicles, trash, bags, objects)

**Files to modify:**
- `lib/firestore.ts` - Update `Sighting` interface type definition
- `app/add-report/page.tsx` - Add new type options in dropdown
- `app/view-list/page.tsx` - Add badge colors for new types
- `app/view-map/page.tsx` - Add marker icons for new types
- `app/detail/[id]/page.tsx` - Add badge colors for new types

**Changes:**
1. Update TypeScript type from `'person' | 'animal' | 'object'` to `'people' | 'animals' | 'places' | 'vehicles' | 'trash' | 'bags' | 'objects'`
2. Add color scheme for badges (e.g., people=red, animals=yellow, places=green, vehicles=orange, trash=brown, bags=purple, objects=blue)
3. Update marker icons on map view (use different colored Google Maps pins)

## Feature 2: Auto-Detect Object Type from Image

**Implementation approach:**
- Use Google Cloud Vision API for image classification
- Create new API endpoint `/api/analyze-image`
- Call this after image upload to detect labels/objects
- Map detected labels to our type categories using keyword matching

**Files to create/modify:**
- `pages/api/analyze-image.ts` - New API endpoint for Vision API
- `app/add-report/page.tsx` - Call analyze endpoint after image upload, auto-populate type dropdown

**Logic:**
- After user uploads image, send to Vision API
- Analyze labels/objects detected
- Map keywords to types:
  - "person", "face", "man", "woman" → people
  - "dog", "cat", "bird", "animal" → animals
  - "building", "landmark", "street" → places
  - "car", "truck", "vehicle", "bike" → vehicles
  - "garbage", "waste", "trash" → trash
  - "bag", "backpack", "luggage" → bags
  - Default → objects

**Dependencies:**
- Add `@google-cloud/vision` package
- Enable Cloud Vision API in GCP Console
- Add service account credentials

## Feature 3: Replace Lat/Long with Single Address Field

**Files to modify:**
- `app/add-report/page.tsx` - Replace two number inputs with single text input
- Backend still stores lat/lng in database (no schema changes needed)

**Changes:**
1. Remove latitude/longitude number inputs from form
2. Add single text input for "Address" (e.g., "Shirokanedai, Minato City, Tokyo")
3. When location is detected from EXIF/browser:
   - Reverse geocode to get human-readable address
   - Display in address field (editable by user)
4. On form submit:
   - If address is edited, forward geocode to get lat/lng coordinates
   - Store lat/lng in database as before
5. Keep internal lat/lng storage for map functionality

**New functionality needed:**
- Forward geocoding: Convert address string → lat/lng using Google Geocoding API
- Allow user to edit the auto-populated address
- Validate that address can be geocoded before submission

---

## Estimated Changes Summary:
- **7 files modified** (firestore.ts, add-report page, view-list page, view-map page, detail page, 2 API files)
- **1 new file** (analyze-image API endpoint)
- **1 new npm package** (@google-cloud/vision)
- **2 GCP APIs to enable** (Cloud Vision API, keep Geocoding API)
