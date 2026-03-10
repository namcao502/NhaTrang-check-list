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

export interface WeatherData {
  temperature_max: number;
  temperature_min: number;
  weathercode: number;
  rain_probability: number;
}

export interface WeatherSuggestion {
  text: string;
  icon: string;
}

export interface Destination {
  name: string;
  lat: number;
  lon: number;
}

export interface WeatherCache {
  data: WeatherData;
  lat: number;
  lon: number;
  date: string;
  timestamp: number;
}

export interface ArchivedTrip {
  id: string;
  name: string;
  date: string;
  categories: Category[];
  checkedCount: number;
  totalCount: number;
}
