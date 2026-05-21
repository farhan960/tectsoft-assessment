import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef =
  createNavigationContainerRef<RootStackParamList>();

export function navigateToItemDetail(itemId: string): void {
  if (!navigationRef.isReady()) {
    return;
  }

  const current = navigationRef.getCurrentRoute();
  if (
    current?.name === 'ItemDetail' &&
    current.params &&
    'itemId' in current.params &&
    current.params.itemId === itemId
  ) {
    return;
  }

  navigationRef.reset({
    index: 1,
    routes: [
      { name: 'ItemsList' },
      { name: 'ItemDetail', params: { itemId } },
    ],
  });
}
