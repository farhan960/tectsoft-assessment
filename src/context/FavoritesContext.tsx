import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import {
  fetchFavoriteItemIds,
  toggleFavorite as toggleFavoriteApi,
} from '../services/favoritesService';
import { planOptimisticFavoriteToggle } from './favoritesOptimistic';

type FavoritesContextValue = {
  favoriteIds: Set<string>;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => Promise<string | null>;
  isLoading: boolean;
  refreshFavorites: () => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const refreshFavorites = useCallback(async () => {
    if (!session) {
      setFavoriteIds(new Set());
      return;
    }

    setIsLoading(true);
    try {
      const ids = await fetchFavoriteItemIds();
      setFavoriteIds(new Set(ids));
    } catch {
      setFavoriteIds(new Set());
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void refreshFavorites();
  }, [refreshFavorites]);

  const isFavorite = useCallback(
    (id: string) => favoriteIds.has(id),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(async (id: string): Promise<string | null> => {
    let snapshot: Set<string> | undefined;

    setFavoriteIds(prev => {
      const plan = planOptimisticFavoriteToggle(prev, id);
      snapshot = plan.snapshot;
      return plan.next;
    });

    try {
      await toggleFavoriteApi(id);
      return null;
    } catch (err) {
      if (snapshot) {
        setFavoriteIds(snapshot);
      }
      return err instanceof Error
        ? err.message
        : 'Failed to update favorite.';
    }
  }, []);

  const value = useMemo(
    () => ({
      favoriteIds,
      isFavorite,
      toggleFavorite,
      isLoading,
      refreshFavorites,
    }),
    [favoriteIds, isFavorite, toggleFavorite, isLoading, refreshFavorites],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}
