import type { RootStackParamList } from './types';

export type ItemDetailStackState = {
  index: number;
  routes: Array<{
    name: keyof RootStackParamList;
    params?: RootStackParamList[keyof RootStackParamList];
  }>;
};

export function buildItemDetailStackState(itemId: string): ItemDetailStackState {
  return {
    index: 1,
    routes: [
      { name: 'ItemsList' },
      { name: 'ItemDetail', params: { itemId } },
    ],
  };
}
