import { useQuery } from '@tanstack/react-query';
import { fetchProducts, ShopifyProduct } from '@/lib/shopify';
import { ProductCard } from './ProductCard';
import { Loader2 } from 'lucide-react';

interface ProductGridProps {
  filterLiked?: boolean;
  likedProductIds?: string[];
}

export function ProductGrid({ filterLiked = false, likedProductIds = [] }: ProductGridProps) {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProducts(50),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 px-4">
        <p className="text-sm text-muted-foreground text-center">
          Failed to load products. Please try again.
        </p>
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
    <div className="masonry-grid px-3 py-4">
      {displayProducts.map((product: ShopifyProduct, index: number) => (
        <ProductCard key={product.node.id} product={product} index={index} />
      ))}
    </div>
  );
}
