import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FILTERS, FILTER_LABELS, FilterCategory } from '@/constants/filters';
import { FilterModal } from './FilterModal';

interface FilterBarProps {
  onFilterChange?: (filters: FilterState) => void;
  onSortChange?: (sort: 'popular' | 'latest') => void;
  postCount?: number;
}

export interface FilterState {
  season?: string[];
  style?: string[];
  brand?: string[];
  category?: string[];
  gender?: string[];
}

export function FilterBar({ onFilterChange, onSortChange, postCount }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({});
  const [activeModal, setActiveModal] = useState<FilterCategory | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'latest'>('latest');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const handleFilterApply = (key: FilterCategory, selected: string[]) => {
    const newFilters = {
      ...filters,
      [key]: selected.length > 0 ? selected : undefined,
    };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleResetAll = () => {
    setFilters({});
    onFilterChange?.({});
  };

  const handleSortChange = (sort: 'popular' | 'latest') => {
    setSortBy(sort);
    setShowSortMenu(false);
    onSortChange?.(sort);
  };

  const filterKeys: FilterCategory[] = ['gender', 'season', 'style', 'category', 'brand'];

  // 선택된 필터 개수 계산
  const totalSelectedCount = filterKeys.reduce((count, key) => {
    return count + (filters[key]?.length || 0);
  }, 0);

  return (
    <div className="bg-white sticky top-0 z-20 border-b">
      {/* 한 줄에 필터 + 포스트 수 + 정렬 */}
      <div className="container mx-auto px-4 py-3 flex items-center gap-2">
        {/* 필터 버튼들 */}
        <div className="flex items-center gap-2 overflow-x-auto flex-1">
          {totalSelectedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAll}
              className="text-xs whitespace-nowrap border-red-300 text-red-500 hover:bg-red-50"
            >
              초기화 ({totalSelectedCount})
            </Button>
          )}

          {filterKeys.map((key) => {
            const count = filters[key]?.length || 0;
            return (
              <Button
                key={key}
                variant="outline"
                size="sm"
                className={`text-xs whitespace-nowrap ${
                  count > 0 ? 'border-black bg-black text-white hover:bg-gray-800' : ''
                }`}
                onClick={() => setActiveModal(key)}
              >
                {FILTER_LABELS[key]}
                {count > 0 && <span className="ml-1 font-bold">{count}</span>}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            );
          })}
        </div>

        {/* 포스트 수 + 정렬 (오른쪽) */}
        <div className="flex items-center gap-3 text-xs text-gray-600 whitespace-nowrap">
          <span>{postCount !== undefined ? `${postCount.toLocaleString()}개` : ''}</span>
          
          {/* 정렬 드롭다운 */}
          <div className="relative">
            <button 
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium"
            >
              {sortBy === 'popular' ? '인기순' : '최신순'} 
              <ChevronDown className="w-3 h-3" />
            </button>
            
            {showSortMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowSortMenu(false)} 
                />
                <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-50 py-1 min-w-[80px]">
                  <button
                    onClick={() => handleSortChange('latest')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      sortBy === 'latest' ? 'font-bold text-black' : 'text-gray-600'
                    }`}
                  >
                    최신순
                  </button>
                  <button
                    onClick={() => handleSortChange('popular')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      sortBy === 'popular' ? 'font-bold text-black' : 'text-gray-600'
                    }`}
                  >
                    인기순
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filter Modals */}
      {filterKeys.map((key) => (
        <FilterModal
          key={key}
          isOpen={activeModal === key}
          onClose={() => setActiveModal(null)}
          title={FILTER_LABELS[key]}
          options={FILTERS[key]}
          selectedValues={filters[key] || []}
          onApply={(selected) => handleFilterApply(key, selected)}
        />
      ))}
    </div>
  );
}
