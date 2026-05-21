import { supabase } from '../lib/supabase';
import type { ItemRow } from '../types/database';
import type { Item, ItemsPage } from '../types/item';

export const PAGE_SIZE = 20;

const ITEM_COLUMNS = 'id, title, description, created_at';

function mapRowToItem(row: ItemRow): Item {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    createdAt: row.created_at,
  };
}

function toErrorMessage(error: { message: string } | null): string {
  return error?.message ?? 'Something went wrong. Please try again.';
}

export async function fetchItemsPage(page: number): Promise<ItemsPage> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from('items')
    .select(ITEM_COLUMNS, { count: 'exact' })
    .order('created_at', { ascending: false })
    .order('id', { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(toErrorMessage(error));
  }

  const rows = (data ?? []) as ItemRow[];
  const total = count ?? 0;

  return {
    items: rows.map(mapRowToItem),
    hasMore: from + rows.length < total,
    total,
  };
}

export async function fetchItemById(id: string): Promise<Item | null> {
  const { data, error } = await supabase
    .from('items')
    .select(ITEM_COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(toErrorMessage(error));
  }

  if (!data) {
    return null;
  }

  return mapRowToItem(data as ItemRow);
}
