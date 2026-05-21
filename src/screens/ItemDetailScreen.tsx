import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { fetchItemById } from '../services/itemsService';
import { useFavorites } from '../context/FavoritesContext';
import { setLastViewedItemId } from '../storage/mmkv';
import { formatItemDate } from '../utils/formatDate';
import type { RootStackScreenProps } from '../navigation/types';

export function ItemDetailScreen({
  route,
  navigation,
}: RootStackScreenProps<'ItemDetail'>) {
  const { itemId } = route.params;
  const { isFavorite, toggleFavorite } = useFavorites();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [createdAt, setCreatedAt] = useState('');

  const loadItem = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    setError(null);
    try {
      const result = await fetchItemById(itemId);
      if (!result) {
        setNotFound(true);
        return;
      }
      setTitle(result.title);
      setDescription(result.description);
      setCreatedAt(result.createdAt);
      setLastViewedItemId(itemId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load item.');
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    void loadItem();
  }, [loadItem]);

  const handleToggleFavorite = () => {
    void toggleFavorite(itemId).then(message => {
      if (message) {
        Alert.alert('Favorite', message);
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Loading item…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.button} onPress={loadItem}>
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (notFound) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Item not found.</Text>
        <Pressable style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const favorited = isFavorite(itemId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.date}>{formatItemDate(createdAt)}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>
        {description || 'No description.'}
      </Text>

      <Pressable
        style={[styles.favoriteButton, favorited && styles.favoriteActive]}
        onPress={handleToggleFavorite}>
        <Text style={styles.favoriteText}>
          {favorited ? 'Remove from favorites' : 'Add to favorites'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16 },
  date: { fontSize: 13, color: '#666' },
  title: { fontSize: 22, fontWeight: '700', marginTop: 8 },
  description: { fontSize: 16, lineHeight: 22, color: '#333', marginTop: 12 },
  favoriteButton: {
    marginTop: 24,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  favoriteActive: { backgroundColor: '#fffbeb', borderColor: '#f59e0b' },
  favoriteText: { fontSize: 16, fontWeight: '600' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  muted: { marginTop: 8, color: '#666' },
  error: { color: '#c00', textAlign: 'center', marginBottom: 16 },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
