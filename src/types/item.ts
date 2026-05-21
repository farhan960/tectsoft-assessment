export type Item = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
};

export type ItemsPage = {
  items: Item[];
  hasMore: boolean;
  total: number;
};
