const SCHEME_PREFIX = /^tectsoft-rn:\/\//i;
const ITEM_PATH = /^item\/([^/]+)\/?$/i;

/**
 * Parses item id from tectsoft-rn://item/<id> (and bare item/<id> paths).
 */
export function parseItemIdFromDeepLink(url: string | null | undefined): string | null {
  if (!url?.trim()) {
    return null;
  }

  try {
    const trimmed = url.trim();
    const path = trimmed.replace(SCHEME_PREFIX, '').split('?')[0];
    const match = path.match(ITEM_PATH);
    const itemId = match?.[1]?.trim();
    return itemId && itemId.length > 0 ? itemId : null;
  } catch {
    return null;
  }
}
