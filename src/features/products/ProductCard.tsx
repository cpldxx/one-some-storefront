import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShopifyProduct } from '@/lib/shopify';
import { useLikedStore } from '@/stores/likedStore';

interface ProductCardProps {
  product: ShopifyProduct;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { toggleLike, isLiked } = useLikedStore();
  const liked = isLiked(product.node.id);
  
  const imageUrl = product.node.images.edges[0]?.node.url;
  
  // Random aspect ratio for masonry effect
  const aspectRatios = ['aspect-[3/4]', 'aspect-[4/5]', 'aspect-square'];
  const aspectRatio = aspectRatios[index % aspectRatios.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="masonry-item product-card"
    >
      <Link to={`/product/${product.node.handle}`} className="block">
        <div className={`relative bg-gray-100 overflow-hidden ${aspectRatio} flex items-center justify-center`}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.node.images.edges[0]?.node.altText || product.node.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                console.log('[ProductCard] Image failed to load:', imageUrl);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-xs">이미지 없음</span>
            </div>
          )}
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleLike(product.node.id);
            }}
            className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-full"
          >
            <Heart
              className={`w-4 h-4 ${liked ? 'fill-foreground' : ''}`}
              strokeWidth={1.5}
            />
          </button>
        </div>
        
        <div className="mt-3 space-y-1">
          {/* 상품명 */}
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{product.node.title}</h3>
        </div>
      </Link>
    </motion.div>
  );
}
