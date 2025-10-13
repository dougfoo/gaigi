// Auto-generated at build time - DO NOT EDIT
export const VERSION = {
  version: '1.4.1',
  hash: '26d68ad25ff4d294abec65b15fd5f5b4b9b019df',
  buildDate: '2025-10-13T12:10:56.941Z',
  recentChanges: [
  "Fix changelog display: commit version.ts to git",
  "Update version file with latest changelog",
  "Release v1.4.0: Add AI-powered auto-type detection",
  "Fix type error in map InfoWindow badge",
  "Release v1.3.0: Expand types and add address-based location input"
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
