// Auto-generated version file
// Version is based on package.json and build timestamp
import packageJson from '../package.json';

// Build timestamp is set at build time
const BUILD_TIMESTAMP = process.env.NEXT_PUBLIC_BUILD_DATE || '2025-10-13T00:00:00.000Z';
const GIT_HASH = process.env.NEXT_PUBLIC_GIT_HASH || 'unknown';

export const VERSION = {
  version: packageJson.version,
  hash: GIT_HASH,
  buildDate: BUILD_TIMESTAMP,
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
