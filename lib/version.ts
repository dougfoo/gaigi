// Auto-generated at build time - DO NOT EDIT
export const VERSION = {
  version: '1.4.0',
  hash: 'd6ab0ff4edee27574f400fefd9ac3bebee612045',
  buildDate: '2025-10-13T10:44:52.700Z',
  recentChanges: [
  "Release v1.4.0: Add AI-powered auto-type detection",
  "Fix type error in map InfoWindow badge",
  "Release v1.3.0: Expand types and add address-based location input",
  "manual commit of latest plan and version file",
  "Release v1.2.1: Mobile-friendly list view and auto-generated changelog"
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
