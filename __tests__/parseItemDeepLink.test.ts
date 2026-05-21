import { parseItemIdFromDeepLink } from '../src/navigation/parseItemDeepLink';

describe('parseItemIdFromDeepLink', () => {
  it('parses tectsoft-rn item URLs', () => {
    expect(parseItemIdFromDeepLink('tectsoft-rn://item/123')).toBe('123');
    expect(
      parseItemIdFromDeepLink(
        'tectsoft-rn://item/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      ),
    ).toBe('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    expect(parseItemIdFromDeepLink('tectsoft-rn://item/123/')).toBe('123');
  });

  it('returns null for invalid URLs', () => {
    expect(parseItemIdFromDeepLink(null)).toBeNull();
    expect(parseItemIdFromDeepLink('tectsoft-rn://items')).toBeNull();
    expect(parseItemIdFromDeepLink('https://example.com/item/1')).toBeNull();
  });
});
