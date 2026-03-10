export interface Suggestion {
  id: string;
  label: string;
  targetCategoryName: string;
  tag?: 'must' | 'opt';
  note?: string;
}

export interface TripContext {
  durationDays: number;
  departureMonth: number;
  isBeachTrip: boolean;
}

export interface SuggestionRule {
  id: string;
  condition: (ctx: TripContext) => boolean;
  suggestions: Suggestion[];
}

export const SUGGESTION_RULES: SuggestionRule[] = [
  {
    id: "rule-beach-always",
    condition: (ctx) => ctx.isBeachTrip,
    suggestions: [
      {
        id: "suggest-reef-sunscreen",
        label: "Kem chống nắng reef-safe",
        targetCategoryName: "Chống Nắng & Biển",
        tag: "must",
        note: "Bảo vệ san hô khi lặn biển",
      },
      {
        id: "suggest-waterproof-phone-case",
        label: "Ốp điện thoại chống nước",
        targetCategoryName: "Điện Tử & Tiện Ích",
        tag: "must",
        note: "Bảo vệ điện thoại khi đi biển",
      },
    ],
  },
  {
    id: "rule-long-trip",
    condition: (ctx) => ctx.durationDays > 3,
    suggestions: [
      {
        id: "suggest-extra-clothing",
        label: "Quần áo dự phòng thêm",
        targetCategoryName: "Trang Phục",
        tag: "opt",
        note: "Chuyến đi dài hơn 3 ngày, mang thêm đồ thay",
      },
      {
        id: "suggest-laundry-bag",
        label: "Túi đựng đồ giặt",
        targetCategoryName: "Đồ Lặt Vặt Tiện Ích",
        tag: "opt",
        note: "Tách riêng đồ bẩn khi đi dài ngày",
      },
    ],
  },
  {
    id: "rule-extended-trip",
    condition: (ctx) => ctx.durationDays > 5,
    suggestions: [
      {
        id: "suggest-extra-medicine",
        label: "Thuốc dự phòng thêm",
        targetCategoryName: "Thuốc & Sức Khoẻ",
        tag: "must",
        note: "Chuyến đi dài, cần dự phòng thuốc đầy đủ hơn",
      },
      {
        id: "suggest-large-power-bank",
        label: "Pin dự phòng dung lượng lớn",
        targetCategoryName: "Điện Tử & Tiện Ích",
        tag: "opt",
        note: "Chuyến đi dài hơn 5 ngày, cần pin lớn hơn",
      },
    ],
  },
  {
    id: "rule-rainy-season",
    condition: (ctx) => ctx.departureMonth >= 5 && ctx.departureMonth <= 10,
    suggestions: [
      {
        id: "suggest-umbrella",
        label: "Ô / dù gấp gọn",
        targetCategoryName: "Đồ Lặt Vặt Tiện Ích",
        tag: "must",
        note: "Mùa mưa (tháng 5-10), mưa bất chợt",
      },
      {
        id: "suggest-rain-jacket",
        label: "Áo mưa / áo khoác chống nước",
        targetCategoryName: "Trang Phục",
        tag: "must",
        note: "Mùa mưa cần áo chống nước khi ra ngoài",
      },
    ],
  },
];
