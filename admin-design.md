# Admin Feature Design

This document outlines the minimal, production-conscious design for adding an Admin area to GaiGi with:
- Admin login (fixed username/password for now)
- Moderation: View and delete sightings
- Activity: View page-views per route

The design favors server-side checks, simple state, and auditability, and fits the current Next.js App Router UI with API routes in `pages/api` and Firestore.

## Goals
- Keep admin auth simple initially (fixed credentials), upgradeable later to Firebase Auth or OAuth.
- Restrict access to `/admin/**` routes via an HTTP-only session cookie and server-side checks.
- Provide a basic entries view with pagination and deletion.
- Track and display page-view counts per route (Home, Add Report, View Map, View List, Detail pages).

## Architecture Overview
- UI: Next.js pages under `app/admin/*` for login and dashboard sections.
- API: Admin-only endpoints under `pages/api/admin/*` for login/logout, entries listing, deletion, and analytics.
- Session: Signed HTTP-only cookie (`admin_session`) checked by server handlers and a Next.js middleware gate for `/admin/*`.
- Data:
  - Reuse `sightings` collection for entries.
  - Add `analytics_pageViews` collection for route-level view counters.
  - Optional: Add `deletedSightings` collection for audit (soft-archive on delete).

## Authentication (Fixed Credentials)
- Credentials sourced from environment variables:
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD`
- API endpoint `POST /api/admin/login` validates credentials. On success, set an HTTP-only, `Secure`, `SameSite=Lax` cookie `admin_session` containing a short-lived signed token (HMAC) with:
  - `sub: 'admin'`, `iat`, `exp`, `nonce`
- Token signing key: `ADMIN_SESSION_SECRET` env var.
- Logout endpoint clears the cookie: `POST /api/admin/logout`.
- Middleware guard checks presence + validity of cookie for `/admin/**` routes and admin API endpoints.

Notes:
- Fixed credentials are a temporary measure. Replace later with Firebase Auth + claims.
- Never expose admin status to client JS beyond what the UI needs to render. Prefer server components/redirects.

## Authorization
- Only requests with a valid `admin_session` token may access:
  - `GET /api/admin/entries` (list sightings)
  - `DELETE /api/admin/entries/:id` (delete a sighting)
  - `GET /api/admin/analytics/page-views` (get page view counts)
  - UI under `/admin/**`

## Data Model
- `sightings` (existing): no schema change required for moderation.
- `analytics_pageViews` (new):
  - Document ID: route path (e.g., `"/"`, `"/add-report"`, `"/view-map"`, `"/view-list"`, `"/detail"`)
  - Fields:
    - `count: number` (incremented via Admin SDK)
    - `updatedAt: Timestamp`
  - Alternative: per-day docs (`route + yyyymmdd`) for trends; dashboard can aggregate recent days.
- `deletedSightings` (optional): copy of deleted doc + metadata `{ deletedAt, deletedBy }` for audit.

## API Endpoints

1) POST `/api/admin/login`
- Body: `{ username: string, password: string }`
- Validates against env vars. On success, sets `admin_session` cookie and returns `{ success: true }`.
- On failure, 401.

2) POST `/api/admin/logout`
- Clears cookie. Returns `{ success: true }`.

3) GET `/api/admin/entries`
- Query: `page` (default 1), `pageSize` (default 20), optional `type`, `q`
- Returns `{ items: Sighting[], total: number, page, pageSize }` ordered by `createdAt desc`.
- Uses Admin SDK (`adminDb`) to avoid client rules friction.

4) DELETE `/api/admin/entries/:id`
- Deletes the sighting by ID (hard delete). If audit is enabled, first write a copy into `deletedSightings`.
- Returns `{ success: true }`.

5) GET `/api/admin/analytics/page-views`
- Returns an array `{ route: string, count: number, updatedAt: string }` ordered by count desc.

6) POST `/api/analytics/track`
- Public endpoint to increment a page’s view count server-side via Admin SDK. Body: `{ route: string }`.
- Validates a small allowlist of known routes to avoid abuse.

Security
- Admin endpoints must verify `admin_session`.
- `track` endpoint only accepts known routes and applies basic rate limiting (e.g., best-effort via IP + short cache; optional for MVP).

## Admin UI (App Router)

Routes
- `app/admin/login/page.tsx` – login form; posts to `/api/admin/login`.
- `app/admin/page.tsx` – dashboard landing with quick stats (counts per type, total, last 24h views).
- `app/admin/entries/page.tsx` – paginated table of sightings with:
  - Columns: thumb, type, description, createdAt, location, anonymous?, actions (view/delete)
  - Delete button triggers confirmation, calls DELETE endpoint, refreshes list
  - Filters: type dropdown; search by description text
- `app/admin/analytics/page.tsx` – table/cards of page-views per route with counts, simple sparkline if using per-day docs.

Navigation
- Minimal header with “Entries”, “Analytics”, and “Logout”.

Guarding
- `middleware.ts` gate for `/admin/:path*`: if no valid `admin_session`, redirect to `/admin/login`.
- Server component pattern: reading cookies and redirecting at the top of each admin page also works if middleware is not preferred.

## Page View Tracking

Instrumentation Strategy
- On each page (client), send a fire-and-forget request to `POST /api/analytics/track` with the route path.
- The API validates the route and increments a counter in Firestore using Admin SDK:
  - `adminDb.collection('analytics_pageViews').doc(route).set({ count: FieldValue.increment(1), updatedAt: Timestamp.now() }, { merge: true })`
- Tracked Routes: `/`, `/add-report`, `/view-map`, `/view-list`, `/detail` (detail counts overall, not per ID for MVP).

Performance/Cost
- Batched or debounced on client if necessary; for MVP, a single call per page render is acceptable.

## Session Implementation Details

Token
- Prefer a compact signed JSON token using HMAC-SHA256:
  - Header: `{ alg: 'HS256', typ: 'JWT' }`
  - Payload: `{ sub: 'admin', iat, exp, nonce }`
  - Secret: `ADMIN_SESSION_SECRET`
- Store in `admin_session` cookie (HTTP-only, Secure, SameSite=Lax, Path=/, Max-Age ~ 12h).

Validation
- Shared utility to sign/verify tokens in `lib/adminSession.ts`.
- Middleware/handlers import this to check session presence & expiry.

## Error Handling & UX
- Show clear error messages for invalid login.
- Confirm before delete; show toast/snackbar on success/failure.
- Handle empty states (no entries, no analytics yet).

## Environment Variables
- `ADMIN_USERNAME` – required for login.
- `ADMIN_PASSWORD` – required for login.
- `ADMIN_SESSION_SECRET` – required for signing session cookie.

## File/Code Map (Proposed)

UI (App Router)
- `app/admin/login/page.tsx`
- `app/admin/page.tsx` (dashboard)
- `app/admin/entries/page.tsx`
- `app/admin/analytics/page.tsx`
- `middleware.ts` (protect `/admin/**`)

API (Pages Router)
- `pages/api/admin/login.ts`
- `pages/api/admin/logout.ts`
- `pages/api/admin/entries.ts` (GET)
- `pages/api/admin/entries/[id].ts` (DELETE)
- `pages/api/admin/analytics/page-views.ts` (GET)
- `pages/api/analytics/track.ts` (POST)

Lib
- `lib/adminSession.ts` – sign/verify admin tokens + cookie helpers
- `lib/adminOnly.ts` – helper to guard API handlers

## Deletion Strategy
- MVP: hard delete from `sightings`.
- Optional audit: write the existing document to `deletedSightings/{id}` with `{ deletedAt, deletedBy: 'admin' }` before deleting.

## Testing Plan (Manual)
- Set env vars; restart dev.
- Login with correct and incorrect credentials; verify cookie issuance.
- Try accessing `/admin/entries` without login; expect redirect.
- Create a few sightings; confirm they appear in admin list.
- Delete a sighting; verify removal and (if enabled) audit copy.
- Navigate through pages; validate `analytics_pageViews` increments and appear in admin analytics.

## Future Enhancements
- Replace fixed login with Firebase Auth (admin claim or email allowlist).
- Role-based access (admin, moderator, viewer).
- More analytics (per-sighting views, trends, time-series charts).
- Bulk actions (bulk delete), export CSV.
- Audit logs and activity feed for admin actions.

