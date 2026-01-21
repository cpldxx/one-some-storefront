// 패션 커뮤니티 필터 카테고리 정의 (영어)

export const FILTERS = {
  gender: ['Male', 'Female', 'Unisex'],
  season: ['Spring', 'Summer', 'Autumn', 'Winter'],
  style: ['Minimal', 'Street', 'Casual', 'Sporty', 'Classic', 'Grunge', 'City Boy', 'Gorpcore', 'Amekaji', 'Workwear'],
  category: ['Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Bag', 'Accessories', 'Headwear'],
  brand: ['Nike', 'Adidas', 'Stussy', 'Supreme', 'New Balance', 'Other']
};

// 필터 카테고리 타입
export type FilterCategory = keyof typeof FILTERS;

// 선택된 필터 상태 타입
export type SelectedFilters = {
  [K in FilterCategory]?: string[];
};

// 한글 라벨 (UI 표시용)
export const FILTER_LABELS: Record<FilterCategory, string> = {
  gender: 'Gender',
  season: 'Season',
  style: 'Style',
  category: 'Category',
  brand: 'Brand'
};

// 아이콘 (UI 표시용)
export const FILTER_ICONS: Record<FilterCategory, string> = {
  gender: '👥',
  season: '🌸',
  style: '✨',
  category: '👔',
  brand: '🏷️'
};
