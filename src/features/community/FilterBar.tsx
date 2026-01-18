import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterBarProps {
  onFilterChange?: (filters: FilterState) => void;
}

export interface FilterState {
  season?: string;
  style?: string;
  brand?: string;
  category?: string;
  gender?: string;
}

const FILTER_OPTIONS = {
  gender: ['Male', 'Female', 'Unisex'],
  season: ['Spring', 'Summer', 'Fall', 'Winter'],
  style: ['Casual', 'Minimal', 'Romantic', 'Trendy', 'Classic', 'Street'],
  category: ['Top', 'Bottom', 'Outer', 'Dress', 'Shoes', 'Accessories'],
  brand: ['ZARA', 'Musinsa', 'H&M', 'Uniqlo', 'Ably'],
};

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleFilterSelect = (key: string, value: string) => {
    const newFilters = {
      ...filters,
      [key]: filters[key as keyof FilterState] === value ? undefined : value,
    };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
    setOpenDropdown(null);
  };

  const filterTags = [
    { label: 'Gender', key: 'gender', icon: '👥' },
    { label: 'Season', key: 'season', icon: '🌸' },
    { label: 'Style', key: 'style', icon: '✨' },
    { label: 'Category', key: 'category', icon: '👔' },
    { label: 'Brand', key: 'brand', icon: '🏷️' },
  ];

  return (
    <div className="bg-white sticky top-0 z-20 border-b">
      {/* Top Navigation Tabs */}
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-6 h-12 border-b">
          <button className="text-sm font-semibold text-gray-900 border-b-2 border-gray-900 pb-3 h-12 flex items-center">
            스냅
          </button>
          <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors pb-3 h-12 flex items-center">
            투데이
          </button>
          <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors pb-3 h-12 flex items-center">
            랭킹
          </button>
          <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors pb-3 h-12 flex items-center">
            팔로잉
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="container mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto pb-2">
        {filterTags.map((tag) => (
          <div key={tag.key} className="relative">
            <Button
              variant="outline"
              size="sm"
              className="text-xs whitespace-nowrap"
              onClick={() => setOpenDropdown(openDropdown === tag.key ? null : tag.key)}
            >
              {tag.icon} {tag.label}
              {filters[tag.key as keyof FilterState] && (
                <span className="ml-1 text-red-500 font-bold">✓</span>
              )}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>

            {/* Dropdown Menu */}
            {openDropdown === tag.key && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-30 min-w-max">
                {FILTER_OPTIONS[tag.key as keyof typeof FILTER_OPTIONS].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleFilterSelect(tag.key, option)}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-b last:border-b-0 transition-colors ${
                      filters[tag.key as keyof FilterState] === option
                        ? 'bg-gray-100 font-semibold text-gray-900'
                        : 'text-gray-700'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Count & Sort */}
      <div className="container mx-auto px-4 py-2 flex items-center justify-between text-xs text-gray-600 border-t">
        <span>1,157,411개</span>
        <button className="flex items-center gap-1 hover:text-gray-900 transition-colors">
          인기순 <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
