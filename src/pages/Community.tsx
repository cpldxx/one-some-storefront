import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/features/layout/Layout';
import { FilterBar, FilterState } from '@/features/community/FilterBar';
import { StyleGrid } from '@/features/community/StyleGrid';
import { UploadModal } from '@/features/community/UploadModal';
import { supabase } from '@/lib/supabase';
import { Plus } from 'lucide-react';

const Community = () => {
  const [filters, setFilters] = useState<FilterState>({});
  const [sortBy, setSortBy] = useState<'popular' | 'latest'>('latest');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [postCount, setPostCount] = useState<number | undefined>(undefined);
  const navigate = useNavigate();

  // 실제 포스트 수 가져오기
  useEffect(() => {
    const fetchPostCount = async () => {
      const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });
      
      if (!error && count !== null) {
        setPostCount(count);
      }
    };
    fetchPostCount();
  }, []);

  const handleUploadClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('Please login first!');
      navigate('/login');
      return;
    }
    
    setShowUploadModal(true);
  };

  return (
    <Layout>
      <div className="relative">
        <FilterBar 
          onFilterChange={setFilters} 
          onSortChange={setSortBy}
          postCount={postCount} 
        />
        <StyleGrid filters={filters} sortBy={sortBy} />
        
        {/* Floating Upload Button */}
        <button
          onClick={handleUploadClick}
          className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
          aria-label="Upload"
        >
          <Plus className="w-6 h-6" />
        </button>
        
        {/* Upload Modal */}
        <UploadModal 
          open={showUploadModal} 
          onOpenChange={setShowUploadModal} 
        />
      </div>
    </Layout>
  );
};

export default Community;
