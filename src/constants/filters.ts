// Fashion community filter categories (English)

export const FILTERS = {
  gender: ['Male', 'Female', 'Unisex'],
  season: ['Spring', 'Summer', 'Autumn', 'Winter'],
  style: ['Minimal', 'Street', 'Casual', 'Sporty', 'Classic', 'Grunge', 'City Boy', 'Gorpcore', 'Amekaji', 'Workwear'],
  category: ['Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Bag', 'Accessories', 'Headwear'],
  brand: ['Nike', 'Adidas', 'Stussy', 'Supreme', 'New Balance', 'Other']
};

// Filter category type
export type FilterCategory = keyof typeof FILTERS;

// Selected filters state type
export type SelectedFilters = {
  [K in FilterCategory]?: string[];
};

// Labels for UI display
export const FILTER_LABELS: Record<FilterCategory, string> = {
  gender: 'Gender',
  season: 'Season',
  style: 'Style',
  category: 'Category',
  brand: 'Brand'
};

// Icons for UI display
export const FILTER_ICONS: Record<FilterCategory, string> = {
  gender: '👥',
  season: '🌸',
  style: '✨',
  category: '👔',
  brand: '🏷️'
};
