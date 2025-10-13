// Auto-generated at build time - DO NOT EDIT
export const VERSION = {
  version: '1.3.0',
  hash: '3a473103cbbbf4ebeca7df2a4bf2c4f9a14ddd9e',
  buildDate: '2025-10-13T09:21:46.865Z',
  recentChanges: [
  "manual commit of latest plan and version file",
  "Release v1.2.1: Mobile-friendly list view and auto-generated changelog",
  "Release v1.2.0: Improve address geocoding for Japanese locations",
  "Release v1.1.0: Add mini maps and address geocoding to list view",
  "Update Google Maps API key"
],
};

export function getVersionString(): string {
  return VERSION.version;
}

export function getFullVersionString(): string {
  const shortHash = VERSION.hash.substring(0, 7);
  return `${VERSION.version}-${shortHash}`;
}

export function getBuildDate(): string {
  try {
    return new Date(VERSION.buildDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'October 13, 2025';
  }
}

export function getRecentChanges(): string[] {
  return VERSION.recentChanges;
}
