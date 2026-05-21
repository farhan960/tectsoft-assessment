import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const DEEP_LINK_PREFIX = 'tectsoft-rn://';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [DEEP_LINK_PREFIX],
  config: {
    screens: {
      ItemsList: '',
      ItemDetail: 'item/:itemId',
    },
  },
};
