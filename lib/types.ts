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
