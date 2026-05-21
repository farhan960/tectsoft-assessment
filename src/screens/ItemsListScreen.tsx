import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { fetchItemById, fetchItemsPage } from '../services/itemsService';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { getLastViewedItemId } from '../storage/mmkv';
import { formatItemDate } from '../utils/formatDate';
import type { Item } from '../types/item';
import type { RootStackScreenProps } from '../navigation/types';

export function ItemsListScreen({
  navigation,
}: RootStackScreenProps<'ItemsList'>) {
  const { signOut } = useAuth();
  const { isFavorite } = useFavorites();
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastViewedItemId, setLastViewedItemId] = useState<string | null>(null);
  const [continueItem, setContinueItem] = useState<Item | null>(null);

  const loadContinueItem = useCallback(async () => {
    const id = getLastViewedItemId();
    setLastViewedItemId(id);
    if (!id) {
      setContinueItem(null);
      return;
    }
    try {
      setContinueItem(await fetchItemById(id));
    } catch {
      setContinueItem(null);
    }
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => void signOut()} hitSlop={8}>
          <Text style={styles.signOut}>Sign Out</Text>
        </Pressable>
      ),
    });
  }, [navigation, signOut]);

  useEffect(() => {
    void loadContinueItem();
  }, [loadContinueItem]);

  const loadPage = useCallback(async (pageToLoad: number, replace: boolean) => {
    try {
      setError(null);
      const result = await fetchItemsPage(pageToLoad);
      setItems(prev =>
        replace ? result.items : [...prev, ...result.items],
      );
      setHasMore(result.hasMore);
      setPage(pageToLoad);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load items. Pull down to retry.',
      );
    }
  }, []);

  useEffect(() => {
    void (async () => {
      setInitialLoading(true);
      await loadPage(0, true);
      setInitialLoading(false);
    })();
  }, [loadPage]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPage(0, true);
    setRefreshing(false);
    await loadContinueItem();
  }, [loadPage, loadContinueItem]);

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || loadingMore || initialLoading || refreshing) {
      return;
    }
    setLoadingMore(true);
    await loadPage(page + 1, false);
    setLoadingMore(false);
  }, [hasMore, loadingMore, initialLoading, refreshing, loadPage, page]);

  const renderItem = useCallback(
    ({ item }: { item: Item }) => (
      <Pressable
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}>
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.rowMeta}>{formatItemDate(item.createdAt)}</Text>
          {item.description ? (
            <Text style={styles.rowDescription} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </View>
        {isFavorite(item.id) ? (
          <Text style={styles.star} accessibilityLabel="Favorited">
            ★
          </Text>
        ) : null}
      </Pressable>
    ),
    [navigation, isFavorite],
  );

  const listHeader =
    lastViewedItemId && continueItem ? (
      <Pressable
        style={styles.continueBanner}
        onPress={() =>
          navigation.navigate('ItemDetail', { itemId: lastViewedItemId })
        }>
        <Text style={styles.continueText}>
          Continue: {continueItem.title}
        </Text>
      </Pressable>
    ) : null;

  if (initialLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Loading items…</Text>
      </View>
    );
  }

  if (error && items.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.button} onPress={handleRefresh}>
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={items}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      ListHeaderComponent={listHeader}
      contentContainerStyle={
        items.length === 0 ? styles.emptyList : styles.listContent
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.3}
      ListEmptyComponent={
        <Text style={[styles.muted, styles.centeredText]}>No items found.</Text>
      }
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator style={styles.footer} />
        ) : !hasMore && items.length > 0 ? (
          <Text style={styles.endText}>End of list</Text>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: '#f0f0f0' },
  listContent: { padding: 16, paddingBottom: 24 },
  emptyList: { flexGrow: 1, padding: 16 },
  continueBanner: {
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  continueText: { fontSize: 15, fontWeight: '600', color: '#1d4ed8' },
  signOut: { fontSize: 15, color: '#2563eb', marginRight: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  rowPressed: { opacity: 0.92 },
  rowContent: { flex: 1, marginRight: 8 },
  rowTitle: { fontSize: 17, fontWeight: '600', color: '#111' },
  rowMeta: { fontSize: 12, color: '#888', marginTop: 4 },
  rowDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
    marginTop: 6,
  },
  star: { fontSize: 20, color: '#f59e0b', marginTop: 2 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  centeredText: { textAlign: 'center', marginTop: 40 },
  muted: { marginTop: 8, color: '#666' },
  error: { color: '#c00', textAlign: 'center', marginBottom: 16 },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  footer: { paddingVertical: 20 },
  endText: { textAlign: 'center', paddingVertical: 16, color: '#999', fontSize: 13 },
});
