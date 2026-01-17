import { useState } from 'react';
import { Layout } from '@/features/layout/Layout';
import { FilterBar, FilterState } from '@/features/community/FilterBar';
import { StyleGrid } from '@/features/community/StyleGrid';

const Community = () => {
  const [filters, setFilters] = useState<FilterState>({});

  return (
    <Layout>
      <FilterBar onFilterChange={setFilters} />
      <StyleGrid filters={filters} />
    </Layout>
  );
};

export default Community;
