import { StyleCard } from '@/features/community/StyleCard';
import { StylePost } from '@/lib/community';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface TrendingSectionProps {
  posts: StylePost[];
}

export function TrendingSection({ posts }: TrendingSectionProps) {
  const trendingPosts = posts.slice(12, 24); // 4x3 grid

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            🔥 Trending Now
          </h2>
          <p className="text-gray-600">Discover the hottest styles everyone is talking about</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {trendingPosts.map((post) => (
            <StyleCard key={post.id} post={post} />
          ))}
        </div>

        {/* More Button */}
        <div className="flex justify-center mt-8">
          <Link
            to="/community"
            className="inline-flex items-center gap-1 text-gray-900 font-medium hover:text-gray-600 transition-colors group"
          >
            View More
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
