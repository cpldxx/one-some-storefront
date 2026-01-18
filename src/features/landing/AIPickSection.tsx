import { StyleCard } from '@/features/community/StyleCard';
import { StylePost } from '@/types/database';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface AIPickSectionProps {
  posts: StylePost[];
}

export function AIPickSection({ posts }: AIPickSectionProps) {
  const aiPickedPosts = posts.slice(0, 8); // 4x2 grid

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            ✨ AI Picks For You
          </h2>
          <p className="text-gray-600">Personalized style recommendations based on your preferences</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {aiPickedPosts.map((post) => (
            <StyleCard key={post.id} post={post} />
          ))}
        </div>

        {/* View More Button */}
        <div className="flex justify-center mt-8">
          <Link
            to="/community"
            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-light text-sm transition-colors"
          >
            View More
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
