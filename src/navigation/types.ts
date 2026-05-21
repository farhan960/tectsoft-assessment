import type { StackScreenProps } from '@react-navigation/stack';

export type RootStackParamList = {
  Login: undefined;
  ItemsList: undefined;
  ItemDetail: { itemId: string };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;
