export interface Item {
  id: string;
  label: string;
  checked: boolean;
  note?: string;
  tag?: 'must' | 'opt';
  quantity?: number;
}

export interface Category {
  id: string;
  name: string;
  items: Item[];
  icon?: string;
}

export interface Template {
  id: string;
  name: string;
  categories: Category[];
  createdAt: string;
}

export interface ArchivedTrip {
  id: string;
  name: string;
  date: string;
  categories: Category[];
  checkedCount: number;
  totalCount: number;
}
