// Auto-generated at build time - DO NOT EDIT
export const VERSION = {
  version: '1.2.0',
  hash: '2b5e1eee5479b8147a089b877b486977121d0552',
  buildDate: '2025-10-13T06:56:43.872Z',
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
