import { Heart, MessageCircle } from 'lucide-react';
import { StylePost } from '@/types/database';
import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { togglePostLike } from '@/lib/community';

// Helper function to get display name from profile
const getDisplayName = (profile: any): string => {
  if (!profile) return 'Anonymous';
  
  // Check username first
  if (profile.username) {
    // If username looks like an email, extract the part before @
    if (profile.username.includes('@')) {
      return profile.username.split('@')[0];
    }
    return profile.username;
  }
  
  // Fallback to email
  if (profile.email) {
    return profile.email.split('@')[0];
  }
  
  return 'Anonymous';
};

interface StyleCardProps {
  post: StylePost;
  onLikeUpdate?: (postId: string, likeCount: number) => void;
}

export function StyleCard({ post, onLikeUpdate }: StyleCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [commentCount, setCommentCount] = useState(post.comment_count);
  const [isLiking, setIsLiking] = useState(false);

  // Update state when post prop changes (changed elsewhere)
  useEffect(() => {
    setLiked(post.is_liked || false);
    setLikeCount(post.like_count);
    setCommentCount(post.comment_count);
  }, [post.is_liked, post.like_count, post.comment_count]);

  const handleLike = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isLiking) return; // Prevent duplicate clicks
    
    // Login check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please login to like!');
      navigate('/login');
      return;
    }
    
    setIsLiking(true);
    
    // Optimistic update (change UI first)
    const newLiked = !liked;
    const newCount = newLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
    setLiked(newLiked);
    setLikeCount(newCount);
    
    // Update React Query cache immediately for all queries
    queryClient.setQueriesData({ queryKey: ['style-posts'] }, (oldData: any) => {
      if (!oldData?.pages) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page: StylePost[]) =>
          page.map((p: StylePost) =>
            p.id === post.id
              ? { ...p, is_liked: newLiked, like_count: newCount }
              : p
          )
        ),
      };
    });
    
    try {
      // Save to DB
      const result = await togglePostLike(post.id, user.id);
      setLiked(result.liked);
      setLikeCount(result.likeCount);
      
      // Update cache with actual values from DB
      queryClient.setQueriesData({ queryKey: ['style-posts'] }, (oldData: any) => {
        if (!oldData?.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: StylePost[]) =>
            page.map((p: StylePost) =>
              p.id === post.id
                ? { ...p, is_liked: result.liked, like_count: result.likeCount }
                : p
            )
          ),
        };
      });
      
      onLikeUpdate?.(post.id, result.likeCount);
    } catch (error) {
      // Rollback on failure
      setLiked(liked);
      setLikeCount(likeCount);
      
      // Rollback cache
      queryClient.setQueriesData({ queryKey: ['style-posts'] }, (oldData: any) => {
        if (!oldData?.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: StylePost[]) =>
            page.map((p: StylePost) =>
              p.id === post.id
                ? { ...p, is_liked: liked, like_count: likeCount }
                : p
            )
          ),
        };
      });
      
      console.error('Like failed:', error);
    } finally {
      setIsLiking(false);
    }
  }, [post.id, liked, likeCount, isLiking, navigate, onLikeUpdate, queryClient]);

  const handleCardClick = () => {
    navigate(`/community/${post.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative bg-gray-100 aspect-[3/4] overflow-hidden group">
        <img
          src={encodeURI(post.image_url)}
          alt={post.description}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            console.log('[StyleCard] Image failed:', post.image_url);
            e.currentTarget.style.display = 'none';
          }}
        />

        {/* Like Button - Top Right */}
        <button
          onClick={handleLike}
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-all z-10"
          aria-label="Like"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              liked ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
            }`}
          />
        </button>

        {/* User Info Overlay - Bottom Left */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <div className="flex items-center gap-2">
            {post.profile?.avatar_url && (
              <img
                src={post.profile.avatar_url}
                alt={post.profile.username || 'User'}
                className="w-8 h-8 rounded-full border-2 border-white object-cover"
              />
            )}
            <span className="text-white text-sm font-semibold">
              {post.profile?.username || 'Anonymous'}
            </span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-3">
        {/* Description */}
        <p className="text-xs text-gray-600 line-clamp-2 mb-2">{post.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {post.tags.season?.[0] && (
            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              {post.tags.season[0]}
            </span>
          )}
          {post.tags.style?.[0] && (
            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              {post.tags.style[0]}
            </span>
          )}
          {post.tags.brand?.[0] && (
            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              {post.tags.brand[0]}
            </span>
          )}
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center text-xs text-gray-600 border-t pt-2">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-1 transition-colors ${liked ? 'text-red-500' : 'hover:text-red-500'}`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
              <span>{likeCount.toLocaleString()}</span>
            </button>
            <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>{commentCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
