import { Layout } from '@/features/layout/Layout';
import { ProductGrid } from '@/features/products/ProductGrid';
import { HeroSection } from '@/features/landing/HeroSection';
import { TodayRecommendedSection } from '@/features/landing/TodayRecommendedSection';
import { CTASection } from '@/features/landing/CTASection';
import { LandingFooter } from '@/features/landing/LandingFooter';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <TodayRecommendedSection />
      <ProductGrid showTitle={true} />
      <CTASection />
      <LandingFooter />
    </Layout>
  );
};

export default Index;
