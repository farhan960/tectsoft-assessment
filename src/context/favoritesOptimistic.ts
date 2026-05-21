export type OptimisticTogglePlan = {
  snapshot: Set<string>;
  next: Set<string>;
};

/** Applies an optimistic add/remove for one item id. */
export function planOptimisticFavoriteToggle(
  current: Set<string>,
  itemId: string,
): OptimisticTogglePlan {
  const next = new Set(current);
  if (next.has(itemId)) {
    next.delete(itemId);
  } else {
    next.add(itemId);
  }
  return { snapshot: current, next };
}

export type OptimisticToggleOutcome<T> =
  | { ok: true; next: Set<string>; value: T }
  | { ok: false; snapshot: Set<string>; error: string };

/** Runs optimistic toggle logic around an async action (for tests and context). */
export async function runOptimisticFavoriteToggle<T>(
  current: Set<string>,
  itemId: string,
  action: (id: string) => Promise<T>,
  formatError: (err: unknown) => string = err =>
    err instanceof Error ? err.message : 'Failed to update favorite.',
): Promise<OptimisticToggleOutcome<T>> {
  const { snapshot, next } = planOptimisticFavoriteToggle(current, itemId);

  try {
    const value = await action(itemId);
    return { ok: true, next, value };
  } catch (err) {
    return { ok: false, snapshot, error: formatError(err) };
  }
}
