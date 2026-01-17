import { useQuery } from '@tanstack/react-query';
import { fetchStylePosts, filterStylePosts, StylePost } from '@/lib/community';
import { StyleCard } from './StyleCard';
import { Loader2 } from 'lucide-react';
import { FilterState } from './FilterBar';

interface StyleGridProps {
  filters?: FilterState;
}

export function StyleGrid({ filters }: StyleGridProps) {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['stylePosts', filters],
    queryFn: () => fetchStylePosts(50),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const displayPosts = posts ? filterStylePosts(posts, filters || {}) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (displayPosts.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 px-4">
        <p className="text-sm text-muted-foreground text-center">
          게시물이 없습니다. 필터를 변경해 보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayPosts.map((post: StylePost) => (
          <StyleCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
