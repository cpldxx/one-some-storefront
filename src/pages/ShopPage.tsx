import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/features/layout/Layout';
import { fetchProducts } from '@/lib/shopify';
import { ProductCard } from '@/features/products/ProductCard';

const ShopPage = () => {
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProducts(),
  });

  // 상품이 없으면 Coming Soon 표시
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

  // 상품이 있으면 그리드 표시
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shop</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product, index) => (
              <ProductCard key={product.node.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShopPage;
