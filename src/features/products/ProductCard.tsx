import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShopifyProduct, formatPrice } from '@/lib/shopify';
import { useLikedStore } from '@/stores/likedStore';

interface ProductCardProps {
  product: ShopifyProduct;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { toggleLike, isLiked } = useLikedStore();
  const liked = isLiked(product.node.id);
  
  const imageUrl = product.node.images.edges[0]?.node.url;
  const price = product.node.priceRange.minVariantPrice;
  
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
        <div className={`relative bg-gray-200 overflow-hidden ${aspectRatio} flex items-center justify-center`}>
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
          ) : null}
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm bg-gray-100">
            {product.node.title}
          </div>
          
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
          {/* 브랜드명 */}
          <p className="text-xs text-gray-500">엘그런</p>

          {/* Product Name */}
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{product.node.title}</h3>

          {/* 가격 정보 */}
          <div className="mt-2">
            {/* 할인율 + 현재가 */}
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-pink-600 font-bold text-base">69%</span>
              <span className="text-gray-900 font-bold text-base">
                {formatPrice(price.amount, price.currencyCode)}
              </span>
            </div>
            {/* 정가 */}
            <p className="text-xs text-gray-400 line-through">118,000</p>
          </div>

          {/* 배송 정보 */}
          <p className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-1 inline-block mt-2">
            무료배송
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
