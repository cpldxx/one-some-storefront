import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/features/layout/Layout';
import { ProductCard } from '@/features/products/ProductCard';
import { fetchProducts, ShopifyProduct } from '@/lib/shopify';
import { Loader2 } from 'lucide-react';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProducts(50),
    staleTime: 5 * 60 * 1000,
  });

  const filteredProducts = (products || []).filter((product: ShopifyProduct) =>
    product.node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.node.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="px-3 py-3">
        {/* Search Input */}
        <div className={`relative flex items-center bg-grey-100 transition-all ${
          isFocused ? 'ring-1 ring-foreground' : ''
        }`}>
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full h-10 pl-9 pr-9 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-0.5"
              >
                <X className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Results Count */}
        {searchQuery && !isLoading && (
          <p className="text-xs text-muted-foreground mt-3">
            {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="masonry-grid px-3 pb-4">
          {filteredProducts.map((product: ShopifyProduct, index: number) => (
            <ProductCard key={product.node.id} product={product} index={index} />
          ))}
        </div>
      ) : searchQuery ? (
        <div className="flex items-center justify-center py-20 px-4">
          <p className="text-sm text-muted-foreground text-center">
            No products found for "{searchQuery}"
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-center py-20 px-4">
          <p className="text-sm text-muted-foreground text-center">
            Start typing to search products
          </p>
        </div>
      )}
    </Layout>
  );
}
