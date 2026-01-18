import { useState } from 'react';
import { Layout } from '@/features/layout/Layout';
import { FilterBar, FilterState } from '@/features/community/FilterBar';
import { StyleGrid } from '@/features/community/StyleGrid';
import { UploadModal } from '@/features/community/UploadModal';

const Community = () => {
  const [filters, setFilters] = useState<FilterState>({});

  return (
    <Layout>
      <div className="relative">
        <FilterBar onFilterChange={setFilters} />
        <StyleGrid filters={filters} />
        <UploadModal />
      </div>
    </Layout>
  );
};

export default Community;
