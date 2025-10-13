// Auto-generated at build time - DO NOT EDIT
export const VERSION = {
  version: '1.0.1',
  hash: 'b187ea989299d3d8a53ae389a4fb6e9fd18ff8b6',
  buildDate: '2025-10-13T04:51:52.180Z',
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
