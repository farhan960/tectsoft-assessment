import { createMMKV } from 'react-native-mmkv';

export const authStorage = createMMKV({ id: 'tectsoft-auth' });
export const appStorage = createMMKV({ id: 'tectsoft-app' });

export const StorageKeys = {
  lastViewedItemId: 'lastViewedItemId',
  pendingDeepLinkItemId: 'pendingDeepLinkItemId',
} as const;

export const mmkvSupabaseAdapter = {
  getItem: (key: string): string | null => authStorage.getString(key) ?? null,
  setItem: (key: string, value: string): void => {
    authStorage.set(key, value);
  },
  removeItem: (key: string): void => {
    authStorage.remove(key);
  },
};

export function getLastViewedItemId(): string | null {
  return appStorage.getString(StorageKeys.lastViewedItemId) ?? null;
}

export function setLastViewedItemId(itemId: string): void {
  appStorage.set(StorageKeys.lastViewedItemId, itemId);
}

export function clearLastViewedItemId(): void {
  appStorage.remove(StorageKeys.lastViewedItemId);
}

export function setPendingDeepLinkItemId(itemId: string): void {
  appStorage.set(StorageKeys.pendingDeepLinkItemId, itemId);
}

export function getPendingDeepLinkItemId(): string | null {
  return appStorage.getString(StorageKeys.pendingDeepLinkItemId) ?? null;
}

export function clearPendingDeepLinkItemId(): void {
  appStorage.remove(StorageKeys.pendingDeepLinkItemId);
}

export function consumePendingDeepLinkItemId(): string | null {
  const id = getPendingDeepLinkItemId();
  clearPendingDeepLinkItemId();
  return id;
}
