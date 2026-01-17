import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { StylePost } from '@/lib/community';
import { useState } from 'react';

interface StyleCardProps {
  post: StylePost;
  onLike?: (postId: string) => void;
}

export function StyleCard({ post, onLike }: StyleCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    onLike?.(post.id);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image Container */}
      <div className="relative bg-gray-100 aspect-[3/4] overflow-hidden group">
        <img
          src={post.imageUrl}
          alt={post.description}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            console.log('[StyleCard] Image failed:', post.imageUrl);
            e.currentTarget.style.display = 'none';
          }}
        />

        {/* Like Button - Top Right */}
        <button
          onClick={handleLike}
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-all z-10"
          aria-label="좋아요"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
            }`}
          />
        </button>

        {/* User Info Overlay - Bottom Left */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <div className="flex items-center gap-2">
            <img
              src={post.user.profileImage}
              alt={post.user.name}
              className="w-8 h-8 rounded-full border-2 border-white"
            />
            <span className="text-white text-sm font-semibold">{post.user.name}</span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-3">
        {/* Description */}
        <p className="text-xs text-gray-600 line-clamp-2 mb-2">{post.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {post.tags.season && (
            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              {post.tags.season[0]}
            </span>
          )}
          {post.tags.style && (
            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              {post.tags.style[0]}
            </span>
          )}
          {post.tags.brand && (
            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              {post.tags.brand[0]}
            </span>
          )}
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center justify-between text-xs text-gray-600 border-t pt-2">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
              <Heart className="w-4 h-4" fill="currentColor" />
              <span>{likeCount.toLocaleString()}</span>
            </button>
            <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>{post.commentCount}</span>
            </button>
          </div>
          <button className="hover:text-blue-500 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
