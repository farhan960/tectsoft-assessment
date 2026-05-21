export type ItemRow = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
};

export type FavoriteRow = {
  id: string;
  user_id: string;
  item_id: string;
  created_at: string;
};
