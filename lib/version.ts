// Auto-generated version file
// Version is based on git commit hash and timestamp
export const VERSION = {
  major: 1,
  minor: 0,
  patch: 0,
  hash: process.env.NEXT_PUBLIC_GIT_HASH || 'dev',
  buildDate: process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString(),
};

export function getVersionString(): string {
  return `${VERSION.major}.${VERSION.minor}.${VERSION.patch}`;
}

export function getFullVersionString(): string {
  return `${getVersionString()}-${VERSION.hash.substring(0, 7)}`;
}

export function getBuildDate(): string {
  return new Date(VERSION.buildDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
