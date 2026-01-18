import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/features/layout/Layout';
import { fetchProducts, ShopifyProduct } from '@/lib/shopify';
import { ProductCard } from '@/features/products/ProductCard';

const ShopPage = () => {
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProducts(),
  });

  // If no products, show Coming Soon
  if (products.length === 0) {
    return (
      <Layout>
        <div className="py-32 px-4">
          <div className="container mx-auto text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="space-y-3">
                <p className="text-sm tracking-widest text-gray-500 uppercase">Coming Soon</p>
                <h1 className="text-5xl md:text-6xl font-light text-gray-900">
                  Curated Fashion<br />Coming Your Way
                </h1>
              </div>
              <p className="text-lg text-gray-500 font-light">
                We're carefully selecting the finest fashion items to share with you.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // If products exist, show grid
  return (
    <Layout>
      <div className="py-8 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(products as ShopifyProduct[]).map((product, index) => (
              <ProductCard key={product.node.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShopPage;
