import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/features/layout/Layout';
import { HeroSection } from '@/features/landing/HeroSection';
import { AIPickSection } from '@/features/landing/AIPickSection';
import { TrendingSection } from '@/features/landing/TrendingSection';
import { ShopComingSoonSection } from '@/features/landing/ShopComingSoonSection';
import { fetchStylePosts } from '@/lib/community';

const Index = () => {
  const { data: postsData } = useQuery({
    queryKey: ['style-posts', 0],
    queryFn: () => fetchStylePosts(0, 20),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const stylePosts = postsData || [];

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
