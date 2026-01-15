import { Layout } from '@/features/layout/Layout';
import { ProductGrid } from '@/features/products/ProductGrid';
import { useLikedStore } from '@/stores/likedStore';

export default function LikesPage() {
  const likedProductIds = useLikedStore((state) => state.likedProductIds);

  return (
    <Layout>
      <div className="px-4 py-3">
        <h1 className="text-base font-medium">Likes</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {likedProductIds.length} saved item{likedProductIds.length !== 1 ? 's' : ''}
        </p>
      </div>
      <ProductGrid filterLiked likedProductIds={likedProductIds} />
    </Layout>
  );
}
