import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/features/layout/Layout';
import { HeroSection } from '@/features/landing/HeroSection';
import { AIPickSection } from '@/features/landing/AIPickSection';
import { TrendingSection } from '@/features/landing/TrendingSection';
import { ShopComingSoonSection } from '@/features/landing/ShopComingSoonSection';
import { fetchStylePosts } from '@/lib/community';
import HomeAiSection from "@/components/HomeAiSection";

const Index = () => {
  // Latest posts for AI Picks
  const { data: latestPosts } = useQuery({
    queryKey: ['style-posts', 'latest'],
    queryFn: () => fetchStylePosts(0, 8, undefined, 'latest'),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Popular posts for Trending
  const { data: popularPosts } = useQuery({
    queryKey: ['style-posts', 'popular'],
    queryFn: () => fetchStylePosts(0, 8, undefined, 'popular'),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return (
    <Layout>
      <HeroSection />
      <HomeAiSection />
      <AIPickSection posts={latestPosts || []} />
      <TrendingSection posts={popularPosts || []} />
      <ShopComingSoonSection />
    </Layout>
  );
};

export default Index;
