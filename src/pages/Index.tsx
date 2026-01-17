import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/features/layout/Layout';
import { HeroSection } from '@/features/landing/HeroSection';
import { AIPickSection } from '@/features/landing/AIPickSection';
import { TrendingSection } from '@/features/landing/TrendingSection';
import { ShopComingSoonSection } from '@/features/landing/ShopComingSoonSection';
import { fetchStylePosts } from '@/lib/community';

const Index = () => {
  const { data: stylePosts = [] } = useQuery({
    queryKey: ['style-posts'],
    queryFn: () => fetchStylePosts(),
  });

  return (
    <Layout>
      <HeroSection />
      <AIPickSection posts={stylePosts} />
      <TrendingSection posts={stylePosts} />
      <ShopComingSoonSection />
    </Layout>
  );
};

export default Index;
