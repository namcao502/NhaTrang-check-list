// Centralized Vietnamese UI text constants
// Organized by feature domain for easy maintenance and future i18n

// ---------------------------------------------------------------------------
// Common / Shared
// ---------------------------------------------------------------------------
export const COMMON = {
  ADD: 'Thêm',
  CANCEL: 'Huỷ',
  CLOSE: 'Đóng',
  CONFIRM: 'Xác nhận',
  DELETE: 'Xoá',
  LOADING: 'Đang tải...',
  CHANGE: 'Thay đổi',
  MUST_TAG: 'Quan trọng',
  OPT_TAG: 'Nên có',
  NO_TAG: 'Không',
} as const;

// ---------------------------------------------------------------------------
// Header / Branding
// ---------------------------------------------------------------------------
export const HEADER = {
  TRIP_BADGE: '✈️ Kế hoạch chuyến đi',
  SUBTITLE: '🏖️ Biển · 🎢 Vinwonders · 🦁 Safari',
  ALL_DONE: '🎉 Đã chuẩn bị xong! Chúc cả gia đình có chuyến đi tuyệt vời! 🌊',
} as const;

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------
export const CATEGORY = {
  ADD_BUTTON: '+ Thêm danh mục',
  NAME_PLACEHOLDER: 'Tên danh mục...',
  DELETE_CONFIRM: (name: string) =>
    `Bạn có chắc muốn xoá danh mục "${name}" và tất cả đồ vật bên trong?`,
  DELETE_ARIA: (name: string) => `Xoá danh mục ${name}`,
  COMPLETE_BADGE: '✓ Hoàn thành',
  SELECT_ALL: 'Chọn tất cả',
  DESELECT_ALL: 'Bỏ chọn tất cả',
  EMPTY: 'Chưa có đồ vật nào.',
} as const;

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------
export const ITEM = {
  ADD_PLACEHOLDER: 'Thêm đồ vật...',
  NOTE_PLACEHOLDER: 'Ghi chú...',
  NOTES_OPTIONAL: 'Mô tả (tuỳ chọn)...',
  ADD_NOTE_ARIA: 'Thêm ghi chú',
  DELETE_ARIA: (label: string) => `Xoá ${label}`,
  DECREASE_QTY_ARIA: 'Giảm số lượng',
  INCREASE_QTY_ARIA: 'Tăng số lượng',
  DRAG_ARIA: 'Kéo để sắp xếp',
} as const;

// ---------------------------------------------------------------------------
// Filter
// ---------------------------------------------------------------------------
export const FILTER = {
  SEARCH_PLACEHOLDER: 'Tìm kiếm đồ vật...',
  MUST_ONLY: 'Chỉ quan trọng',
  HIDE_CHECKED: 'Ẩn đã xong',
} as const;

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------
export const STATS = {
  PREP_FORMAT: (checked: number, total: number) =>
    `Đã chuẩn bị ${checked}/${total} đồ vật`,
  READY: '🏖️ Sẵn sàng ra biển rồi!',
  HISTORY: 'Lịch sử',
  RESET: 'Đặt lại',
} as const;

// ---------------------------------------------------------------------------
// Export / Import / Share
// ---------------------------------------------------------------------------
export const EXPORT = {
  COPY_BUTTON: '📋 Sao chép',
  COPY_SUCCESS: 'Đã sao chép!',
  COPY_ERROR: 'Không thể sao chép',
  PRINT_BUTTON: '🖨️ In',
  SHARE_PROGRESS: 'Chia sẻ tiến độ',
} as const;

export const IMPORT = {
  BUTTON: 'Nhập danh sách',
  TITLE: 'Nhập danh sách',
  INSTRUCTIONS: 'Dán danh sách vào đây',
  PLACEHOLDER: '- Kem chống nắng\n- Khăn tắm\n- Kính bơi\n...',
  TO_CATEGORY: 'Nhập vào danh mục',
  CREATE_NEW: '+ Tạo mới...',
  NEW_CATEGORY_PLACEHOLDER: 'Tên danh mục mới...',
  PREVIEW: (count: number) => `Xem trước (${count} món)`,
  SUBMIT: 'Nhập',
} as const;

// ---------------------------------------------------------------------------
// Packing Card
// ---------------------------------------------------------------------------
export const PACKING_CARD = {
  TITLE: 'Chia sẻ tiến độ',
  COPY_SUCCESS: 'Đã sao chép!',
  COPY_ERROR: 'Không thể sao chép',
  COPY_BUTTON: 'Sao chép',
  DOWNLOAD: 'Tải xuống PNG',
  CARD_TITLE: 'Nha Trang',
  CARD_SUBTITLE: 'Biển · Vinwonders · Safari',
  CARD_TODAY: 'Hôm nay là ngày đi!',
  CARD_COUNTDOWN: (days: number) => `Còn ${days} ngày nữa!`,
  CARD_STATS: (checked: number, total: number) =>
    `Đã chuẩn bị ${checked}/${total} đồ vật`,
  CARD_READY: 'Sẵn sàng ra biển!',
} as const;

// ---------------------------------------------------------------------------
// Archive / Trip History
// ---------------------------------------------------------------------------
export const ARCHIVE = {
  TITLE: 'Lưu trước khi đặt lại?',
  DESCRIPTION: 'Bạn có muốn lưu danh sách hiện tại vào lịch sử chuyến đi trước khi đặt lại không?',
  TRIP_NAME_LABEL: 'Tên chuyến đi',
  TRIP_NAME_PLACEHOLDER: 'Tên chuyến đi...',
  TRIP_NAME_DEFAULT: (date: string) => `Chuyến đi ${date}`,
  RESET_NO_SAVE: 'Đặt lại không lưu',
  SAVE_AND_RESET: 'Lưu & Đặt lại',
} as const;

export const HISTORY = {
  TITLE: 'Lịch sử chuyến đi',
  EMPTY: 'Chưa có chuyến đi nào được lưu.',
  DELETE_TRIP: 'Xoá chuyến đi này',
} as const;

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------
export const TEMPLATE = {
  TITLE: 'Mẫu chuyến đi',
  LOAD_CONFIRM: 'Tải mẫu này sẽ thay thế danh sách hiện tại. Bạn có chắc không?',
  ITEM_COUNT: (count: number) => `${count} vật phẩm`,
  DELETE_ARIA: 'Xoá mẫu',
  NEW_PLACEHOLDER: 'Tên mẫu mới...',
  SAVE_NEW: 'Lưu mẫu mới',
} as const;

// ---------------------------------------------------------------------------
// Countdown Banner
// ---------------------------------------------------------------------------
export const COUNTDOWN = {
  SET_DATE: 'Đặt ngày đi',
  PAST_WARNING: '⚠️ Ngày đã qua',
  TRIP_PASSED: 'Chuyến đi đã qua rồi!',
  TRIP_TODAY: '🎉 Hôm nay là ngày đi!',
  FORMAT: (days: number, hours: number, minutes: number, seconds: number) =>
    `✈️ Còn ${days} ngày · ${hours} giờ · ${minutes} phút · ${seconds} giây`,
  NOTIF_ENABLED: 'Nhắc nhở: Bật',
  NOTIF_TOGGLE: 'Nhắc nhở',
} as const;

// ---------------------------------------------------------------------------
// Weather
// ---------------------------------------------------------------------------
export const WEATHER = {
  TITLE: 'Thời tiết',
  RAIN_LABEL: 'Mưa',
  FORECAST_UNAVAILABLE: 'Dự báo chưa có (chỉ hỗ trợ 7 ngày tới)',
  FETCH_ERROR: 'Không thể tải thời tiết',
  UNKNOWN: 'Không rõ',
} as const;

export const DESTINATION = {
  NOT_FOUND: 'Không tìm thấy địa điểm',
  ERROR: 'Lỗi tìm địa điểm',
  PLACEHOLDER: 'Nhập tên thành phố...',
  SEARCHING: 'Đang tìm...',
  CHANGE_ARIA: 'Thay đổi địa điểm',
} as const;

export const WEATHER_SUGGESTIONS = {
  RAIN_JACKET: 'Mang áo mưa!',
  SUNSCREEN: 'Nhớ kem chống nắng!',
  WIDE_HAT: 'Mang mũ rộng vành',
  LIGHT_JACKET: 'Mang áo khoác mỏng',
  THUNDERSTORM: 'Có thể có giông, cẩn thận!',
  FOG_WARNING: 'Trời sương mù, hạn chế đi biển',
  IDEAL_BEACH: 'Thời tiết lý tưởng đi biển!',
} as const;

// ---------------------------------------------------------------------------
// Smart Suggestions
// ---------------------------------------------------------------------------
export const SMART_SUGGEST = {
  TITLE: 'Gợi ý thông minh',
  COUNT: (n: number) => `${n} gợi ý`,
  DISMISS_ARIA: 'Bỏ qua gợi ý',
} as const;

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
export const NOTIFICATION = {
  TITLE: 'Nha Trang Packing List',
  THREE_DAYS: 'Còn 3 ngày — nhớ chuẩn bị!',
  TOMORROW: 'Ngày mai đi rồi! Kiểm tra lại danh sách.',
  TODAY: 'Hôm nay là ngày đi!',
} as const;

// ---------------------------------------------------------------------------
// Undo
// ---------------------------------------------------------------------------
export const UNDO = {
  BUTTON: '↩ Hoàn tác',
} as const;
