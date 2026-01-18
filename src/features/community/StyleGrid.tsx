import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchStylePosts } from '@/lib/community';
import { StyleCard } from './StyleCard';
import { Loader2 } from 'lucide-react';
import { FilterState } from './FilterBar';
import { useEffect, useRef, useCallback } from 'react';
import { StylePost } from '@/types/database';

interface StyleGridProps {
  filters?: FilterState;
}

export function StyleGrid({ filters }: StyleGridProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  // Infinite Query를 사용한 페이지네이션
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['style-posts', filters],
    queryFn: ({ pageParam = 0 }) =>
      fetchStylePosts(pageParam, 20, {
        season: filters?.season,
        style: filters?.style,
        brand: filters?.brand,
        category: filters?.category,
      }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 20 ? allPages.length : undefined,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Intersection Observer를 이용한 무한 스크롤
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts: StylePost[] = data?.pages.flat() || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === 'success' && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 px-4">
        <p className="text-sm text-muted-foreground text-center">
          No posts found. Try changing your filters.
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center py-20 px-4">
        <p className="text-sm text-red-600 text-center">
          Failed to load posts. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {posts.map((post) => (
          <StyleCard key={post.id} post={post} />
        ))}
      </div>

      {/* 무한 스크롤 트리거 */}
      <div ref={observerTarget} className="py-8 flex justify-center">
        {isFetchingNextPage && (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        )}
      </div>

      {!hasNextPage && posts.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No more posts to load</p>
        </div>
      )}
    </div>
  );
}
