import { useQuery } from '@tanstack/react-query';
import { fetchProducts, ShopifyProduct } from '@/lib/shopify';
import { motion } from 'framer-motion';
import { useScrollAnimation, staggerContainer, staggerItem } from '@/hooks/use-scroll-animation';
import { Heart, Loader2 } from 'lucide-react';
import { useCallback } from 'react';
import { useLikedStore } from '@/stores/likedStore';

export const TodayRecommendedSection = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const { likedProductIds, toggleLiked } = useLikedStore();

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProducts(20),
    staleTime: 5 * 60 * 1000,
  });

  console.log('[TodayRecommended] Loading:', isLoading, 'Products:', products?.length, 'Error:', error);

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

  if (!recommendedProducts || recommendedProducts.length === 0) {
    return null;
  }

  return (
    <section ref={ref} className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          variants={staggerContainer}
        >
          {/* 섹션 타이틀 */}
          <motion.div variants={staggerItem} className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              오늘의 추천
            </h2>
            <p className="text-gray-600">지금 인기있는 상품들을 만나보세요</p>
          </motion.div>

          {/* 추천 상품 그리드 */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {recommendedProducts.map((product: ShopifyProduct) => {
              const isLiked = likedProductIds.includes(product.node.id);
              const image = product.node.images.edges[0]?.node;
              const price = product.node.priceRange.minVariantPrice;

              return (
                <motion.div
                  key={product.node.id}
                  variants={staggerItem}
                  className="group"
                >
                  <div className="bg-gray-100 rounded-lg overflow-hidden mb-3 relative aspect-square">
                    {/* 상품 이미지 */}
                    {image && (
                      <img
                        src={image.url}
                        alt={image.altText || product.node.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}

                    {/* 찜하기 버튼 */}
                    <button
                      onClick={() => handleLike(product.node.id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-all"
                      aria-label="찜하기"
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

                  {/* 상품 정보 */}
                  <div>
                    <h3 className="font-semibold text-sm md:text-base text-gray-900 line-clamp-2 mb-2">
                      {product.node.title}
                    </h3>

                    {/* 가격 */}
                    <div className="flex items-center gap-2">
                      <span className="text-red-500 font-bold text-sm md:text-base">
                        예상가
                      </span>
                      <span className="text-gray-900 font-bold text-base md:text-lg">
                        {formatPrice(price.amount)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 line-through mt-1">
                      정가 미정
                    </p>

                    <p className="text-xs text-gray-600 mt-2">무료배송</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
