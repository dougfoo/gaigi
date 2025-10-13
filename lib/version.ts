// Auto-generated at build time - DO NOT EDIT
export const VERSION = {
  version: '1.4.0',
  hash: '208bbef81f4cde3bba30cbcdc42e2068d6c7813e',
  buildDate: '2025-10-13T10:34:52.034Z',
  recentChanges: [
  "Fix type error in map InfoWindow badge",
  "Release v1.3.0: Expand types and add address-based location input",
  "manual commit of latest plan and version file",
  "Release v1.2.1: Mobile-friendly list view and auto-generated changelog",
  "Release v1.2.0: Improve address geocoding for Japanese locations"
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
