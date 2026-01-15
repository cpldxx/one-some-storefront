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
        <div className={`relative bg-grey-100 overflow-hidden ${aspectRatio}`}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.node.images.edges[0]?.node.altText || product.node.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              No image
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
        
        <div className="mt-2 space-y-0.5">
          <h3 className="text-xs font-medium truncate">{product.node.title}</h3>
          <p className="text-xs text-muted-foreground">
            {formatPrice(price.amount, price.currencyCode)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
