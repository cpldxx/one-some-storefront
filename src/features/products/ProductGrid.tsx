import { useQuery } from '@tanstack/react-query';
import { fetchProducts, ShopifyProduct } from '@/lib/shopify';
import { ProductCard } from './ProductCard';
import { Loader2 } from 'lucide-react';

interface ProductGridProps {
  filterLiked?: boolean;
  likedProductIds?: string[];
  showTitle?: boolean;
}

export function ProductGrid({ filterLiked = false, likedProductIds = [], showTitle = false }: ProductGridProps) {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'grid'],
    queryFn: () => fetchProducts(50),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  console.log('[ProductGrid] Loading:', isLoading, 'Products:', products?.length);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  let displayProducts = products || [];
  
  if (filterLiked) {
    displayProducts = displayProducts.filter((product: ShopifyProduct) => 
      likedProductIds.includes(product.node.id)
    );
  }

  if (displayProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <p className="text-sm text-muted-foreground text-center">
          {filterLiked 
            ? "No liked items yet. Explore and save your favorites."
            : "No products found. Add some products to your store."
          }
        </p>
      </div>
    );
  }

  return (
    <section id="products-section" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {showTitle && (
          <div
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              인기 상품
            </h2>
            <p className="text-gray-600 text-lg">
              지금 가장 핫한 아이템을 만나보세요
            </p>
          </div>
        )}
        
        <div
          className="masonry-grid"
        >
          {displayProducts.map((product: ShopifyProduct, index: number) => (
            <div key={product.node.id}>
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
