import { useQuery } from '@tanstack/react-query';
import { fetchProducts, ShopifyProduct } from '@/lib/shopify';
import { Heart, Loader2 } from 'lucide-react';
import { useCallback } from 'react';
import { useLikedStore } from '@/stores/likedStore';

export const TodayRecommendedSection = () => {
  const { likedProductIds, toggleLiked } = useLikedStore();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'recommended'],
    queryFn: () => fetchProducts(50),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: true,
  });

  console.log('[TodayRecommended] Loading:', isLoading, 'Products:', products?.length);

  // 첫 4개 상품 선택
  const recommendedProducts = (products || []).slice(0, 4);

  const formatPrice = (price: string) => {
    return `${parseInt(price).toLocaleString()}원`;
  };

  const handleLike = useCallback((productId: string) => {
    toggleLiked(productId);
  }, [toggleLiked]);

  if (isLoading) {
    return (
      <section className="py-12 bg-white">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  // If no products, don't show section
  if (!recommendedProducts || recommendedProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div>
          {/* Section Title */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Today's Picks
            </h2>
            <p className="text-gray-600">Discover trending products right now</p>
          </div>

          {/* Product Grid */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {recommendedProducts.map((product: ShopifyProduct) => {
              const isLiked = likedProductIds.includes(product.node.id);
              const image = product.node.images.edges[0]?.node;
              const price = product.node.priceRange.minVariantPrice;

              return (
                <div
                  key={product.node.id}
                  className="group"
                >
                  <div className="bg-gray-100 rounded-lg overflow-hidden mb-3 relative aspect-square">
                    {/* Product Image */}
                    {image && (
                      <img
                        src={image.url}
                        alt={image.altText || product.node.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}

                    {/* Like Button */}
                    <button
                      onClick={() => handleLike(product.node.id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-all"
                      aria-label="Like"
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          isLiked
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-600 hover:text-red-500'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div>
                    {/* Brand */}
                    <p className="text-xs text-gray-500 mb-1">Brand</p>

                    {/* Product Name */}
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2">
                      {product.node.title}
                    </h3>

                    {/* Price Info */}
                    <div className="mb-2">
                      {/* Discount + Current Price */}
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-pink-600 font-bold text-lg">
                          69%
                        </span>
                        <span className="text-gray-900 font-bold text-lg">
                          {formatPrice(price.amount)}
                        </span>
                      </div>
                      {/* 정가 */}
                      <p className="text-xs text-gray-400 line-through">
                        118,000
                      </p>
                    </div>

                    {/* 배송 정보 */}
                    <p className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-1 inline-block">
                      무료배송
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
