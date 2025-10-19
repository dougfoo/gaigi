# Phase 3 Implementation Plan: Filtering, Sorting & Pagination

## Feature 1: List View Pagination

**Current behavior:** Shows all sightings in one long list
**New behavior:** Show 10 entries per page with next/back navigation

**Files to modify:**
- `app/view-list/page.tsx` - Add pagination state and controls

**Changes:**
1. Add state for current page number
2. Calculate total pages based on filtered results
3. Slice sightings array to show only current page (10 items)
4. Add pagination controls at bottom:
   - "← Previous" button (disabled on page 1)
   - Page indicator: "Page X of Y"
   - "Next →" button (disabled on last page)
5. Default sort: newest first (by createdAt DESC)
6. Add comments feature that shows # of comments on the list view, and comment details on the detail view (read and add new comments)
7. Fix the list view so clicking on map goes to google maps

**UI Design:**
```
[← Previous] [Page 2 of 5] [Next →]
Showing 11-20 of 47 sightings
```

---

## Feature 2: Multi-Select Type Filter

**Files to modify:**
- `app/view-list/page.tsx` - Add filter UI and logic

**Changes:**
1. Add state for selected types (array of type strings)
2. Add checkbox group above list:
   ```
   Filter by Type:
   ☑ People  ☑ Animals  ☐ Places  ☑ Vehicles  ☐ Trash  ☐ Bags  ☐ Objects
   [Clear All] [Select All]
   ```
3. Filter sightings array before pagination
4. Show count: "Showing X of Y sightings"
5. Persist selections in URL query params (optional)

**Logic:**
```typescript
const filteredSightings = sightings.filter(s =>
  selectedTypes.length === 0 || selectedTypes.includes(s.thingType)
);
```

---

## Feature 3: Distance Filter

**Files to modify:**
- `app/view-list/page.tsx` - Add distance calculation and filter

**Changes:**
1. Get user's current location (browser geolocation)
2. Calculate distance to each sighting using Haversine formula
3. Add distance range slider:
   ```
   Distance: [0km ======|====== 50km]
   Within 25km of your location
   ```
4. Filter sightings within selected radius
5. Display distance on each list item: "📍 2.3km away"

**Helper function:**
```typescript
function calculateDistance(lat1, lon1, lat2, lon2) {
  // Haversine formula
  // Returns distance in kilometers
}
```

**UI Options:**
- Slider ranges: 0km, 5km, 10km, 25km, 50km, 100km
- Default: Show all (no distance filter)
- Disable if location permission denied

---

## Feature 4: Sort Options

**Files to modify:**
- `app/view-list/page.tsx` - Add sort dropdown and logic

**Changes:**
1. Add sort dropdown above list:
   ```
   Sort by: [Newest First ▼]
   ```
2. Sort options:
   - **Newest First** (default) - createdAt DESC
   - **Oldest First** - createdAt ASC
   - **Type A-Z** - thingType ASC
   - **Type Z-A** - thingType DESC
   - **Nearest First** - distance ASC (requires location)
   - **Farthest First** - distance DESC (requires location)

**Logic:**
```typescript
const sortSightings = (sightings: Sighting[], sortBy: string) => {
  switch(sortBy) {
    case 'newest': return [...sightings].sort((a,b) => b.createdAt - a.createdAt);
    case 'oldest': return [...sightings].sort((a,b) => a.createdAt - b.createdAt);
    case 'type-asc': return [...sightings].sort((a,b) => a.thingType.localeCompare(b.thingType));
    case 'type-desc': return [...sightings].sort((a,b) => b.thingType.localeCompare(a.thingType));
    case 'nearest': return [...sightings].sort((a,b) => a.distance - b.distance);
    case 'farthest': return [...sightings].sort((a,b) => b.distance - a.distance);
  }
};
```

---

## Feature 5: Map View Side Panel

**Files to modify:**
- `app/view-map/page.tsx` - Add side panel with list

**Current behavior:** Map only, click marker for popup
**New behavior:** Map + scrollable side panel showing all visible pins

**Changes:**
1. Split screen layout:
   - Left side: Scrollable list (30% width)
   - Right side: Map (70% width)
2. Side panel shows:
   - Thumbnail image (small)
   - Type badge
   - Short description
   - Distance (if location available)
   - Click to center map on marker
3. Sync between list and map:
   - Clicking list item highlights marker and centers map
   - Clicking marker highlights corresponding list item
4. Mobile responsive:
   - Stack vertically on mobile
   - Map on top, list below

**UI Design (Desktop):**
```
┌─────────────────┬────────────────────────────┐
│ Side Panel      │      Google Map            │
│ ─────────────── │                            │
│ 🖼️ [People]     │         📍 📍             │
│ Description...  │      📍      📍            │
│ 1.2km away     │   📍          📍          │
│                 │                            │
│ 🖼️ [Vehicle]    │         📍                │
│ Description...  │                            │
│ 3.4km away     │                            │
│                 │                            │
│ [More items...] │                            │
└─────────────────┴────────────────────────────┘
```

**State Management:**
```typescript
const [selectedSighting, setSelectedSighting] = useState<string | null>(null);
const [mapCenter, setMapCenter] = useState<{lat: number, lng: number}>();
```

---

## Filter/Sort UI Layout (List View)

**Proposed layout:**
```
┌─────────────────────────────────────────────────┐
│ 📋 View List                    [← Back to Home] │
├─────────────────────────────────────────────────┤
│ Filters & Sort                                   │
│ ┌────────────────────────────────────────────┐  │
│ │ Filter by Type:                            │  │
│ │ ☑ People ☑ Animals ☐ Places ☑ Vehicles    │  │
│ │ ☐ Trash  ☐ Bags    ☐ Objects              │  │
│ │ [Clear All] [Select All]                   │  │
│ │                                             │  │
│ │ Distance: [0km ======|====== 50km] 25km    │  │
│ │ 📍 Within 25km of your location            │  │
│ │                                             │  │
│ │ Sort by: [Newest First ▼]                  │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ Showing 11-20 of 47 sightings                   │
│                                                  │
│ [Sighting cards...]                             │
│                                                  │
│ [← Previous] [Page 2 of 5] [Next →]             │
└─────────────────────────────────────────────────┘
```

---

## Implementation Order

1. **List pagination** (simplest, no dependencies)
2. **Sort options** (builds on pagination)
3. **Type filter** (independent feature)
4. **Distance calculation & filter** (requires geolocation)
5. **Map side panel** (separate view enhancement)

---

## Technical Notes

**Distance Calculation (Haversine Formula):**
```typescript
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}
```

**State Management:**
```typescript
// Filters & Sorting State
const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
const [maxDistance, setMaxDistance] = useState<number | null>(null);
const [sortBy, setSortBy] = useState<string>('newest');
const [currentPage, setCurrentPage] = useState(1);
const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

// Derived State
const itemsPerPage = 10;
const filteredSightings = applyFilters(sightings, selectedTypes, maxDistance, userLocation);
const sortedSightings = sortSightings(filteredSightings, sortBy);
const totalPages = Math.ceil(sortedSightings.length / itemsPerPage);
const paginatedSightings = sortedSightings.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);
```

---

## Estimated Changes Summary

- **2 files modified** (view-list page, view-map page)
- **No new dependencies** (use built-in browser geolocation)
- **No API changes** (all client-side filtering/sorting)
- **Responsive design** for mobile filters (collapsible filter panel)
