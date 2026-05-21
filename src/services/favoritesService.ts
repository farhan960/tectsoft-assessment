import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { FavoriteRow } from '../types/database';
import type {
  ToggleFavoriteErrorResponse,
  ToggleFavoriteResponse,
} from '../types/favorites';

function isToggleFavoriteResponse(data: unknown): data is ToggleFavoriteResponse {
  if (!data || typeof data !== 'object') {
    return false;
  }
  const row = data as ToggleFavoriteResponse;
  return (
    typeof row.item_id === 'string' &&
    typeof row.favorited === 'boolean'
  );
}

async function readFunctionError(error: FunctionsHttpError): Promise<string> {
  try {
    const body = (await error.context.json()) as ToggleFavoriteErrorResponse;
    if (body?.error) {
      return body.error;
    }
  } catch {
    // ignore parse errors
  }
  return error.message;
}

export async function fetchFavoriteItemIds(): Promise<string[]> {
  const { data, error } = await supabase.from('favorites').select('item_id');

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as Pick<FavoriteRow, 'item_id'>[];
  return rows.map(row => row.item_id);
}

/** Toggle favorite via edge function — do not write to favorites table from the client. */
export async function toggleFavorite(
  itemId: string,
): Promise<ToggleFavoriteResponse> {
  const { data, error } = await supabase.functions.invoke('toggle-favorite', {
    body: { item_id: itemId },
  });

  if (error instanceof FunctionsHttpError) {
    throw new Error(await readFunctionError(error));
  }

  if (error) {
    throw new Error(error.message);
  }

  const payload = data as unknown;
  if (!isToggleFavoriteResponse(payload)) {
    const errBody = payload as ToggleFavoriteErrorResponse | null;
    if (errBody?.error) {
      throw new Error(errBody.error);
    }
    throw new Error('Invalid response from toggle-favorite');
  }

  return payload;
}
