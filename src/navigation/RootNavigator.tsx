import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';
import type { NavigationState } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import type { RootStackParamList } from './types';
import { ItemsListScreen } from '../screens/ItemsListScreen';
import { ItemDetailScreen } from '../screens/ItemDetailScreen';
import { linking } from './linking';
import {
  buildItemDetailStackState,
  type ItemDetailStackState,
} from './buildInitialStackState';
import { navigationRef, navigateToItemDetail } from './navigationRef';
import { parseItemIdFromDeepLink } from './parseItemDeepLink';
import {
  consumePendingDeepLinkItemId,
  setPendingDeepLinkItemId,
} from '../storage/mmkv';

const Stack = createStackNavigator<RootStackParamList>();

async function resolveDeepLinkItemId(): Promise<string | null> {
  const initialUrl = await Linking.getInitialURL();
  return parseItemIdFromDeepLink(initialUrl);
}

export function RootNavigator() {
  const { session, isLoading: authLoading } = useAuth();
  const [bootstrapDone, setBootstrapDone] = useState(false);
  const [initialState, setInitialState] = useState<
    ItemDetailStackState | undefined
  >(undefined);
  const appliedPostAuthNav = useRef(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const startupItemId = await resolveDeepLinkItemId();

      if (!session) {
        if (startupItemId) {
          setPendingDeepLinkItemId(startupItemId);
        }
        if (!cancelled) {
          setInitialState(undefined);
          setBootstrapDone(true);
        }
        return;
      }

      if (startupItemId && !cancelled) {
        setInitialState(buildItemDetailStackState(startupItemId));
      }

      if (!cancelled) {
        setBootstrapDone(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, session]);

  useEffect(() => {
    if (!session || !bootstrapDone) {
      appliedPostAuthNav.current = false;
      return;
    }

    const pending = consumePendingDeepLinkItemId();
    if (pending) {
      const apply = () => {
        navigateToItemDetail(pending);
        appliedPostAuthNav.current = true;
      };

      if (navigationRef.isReady()) {
        apply();
      } else {
        const id = setInterval(() => {
          if (navigationRef.isReady()) {
            clearInterval(id);
            apply();
          }
        }, 50);
        return () => clearInterval(id);
      }
      return;
    }

    if (!appliedPostAuthNav.current && initialState) {
      appliedPostAuthNav.current = true;
    }
  }, [session, bootstrapDone, initialState]);

  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      const itemId = parseItemIdFromDeepLink(event.url);
      if (!itemId) {
        return;
      }

      if (session) {
        navigateToItemDetail(itemId);
      } else {
        setPendingDeepLinkItemId(itemId);
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);
    return () => subscription.remove();
  }, [session]);

  const navLinking = useMemo(() => {
    if (!session) {
      return undefined;
    }
    return {
      ...linking,
      async getInitialURL() {
        if (initialState) {
          return null;
        }
        return Linking.getInitialURL();
      },
    };
  }, [session, initialState]);

  if (authLoading || !bootstrapDone) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={navLinking}
      initialState={
        session ? (initialState as NavigationState | undefined) : undefined
      }>
      <Stack.Navigator
        screenOptions={{ headerBackTitle: 'Back' }}
        initialRouteName={session ? 'ItemsList' : 'Login'}>
        {session ? (
          <>
            <Stack.Screen
              name="ItemsList"
              component={ItemsListScreen}
              options={{ title: 'Items' }}
            />
            <Stack.Screen
              name="ItemDetail"
              component={ItemDetailScreen}
              options={{ title: 'Item Detail' }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
