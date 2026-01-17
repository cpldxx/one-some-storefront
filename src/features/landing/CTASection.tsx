import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useScrollAnimation, scaleIn } from '@/hooks/use-scroll-animation';
import { ShoppingBag } from 'lucide-react';

export const CTASection = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          variants={scaleIn}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-white rounded-2xl shadow-xl p-12 md:p-16">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-primary" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              지금 바로 시작하세요
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              트렌디한 스트릿 패션부터 클래식한 스타일까지,
              <br />
              당신의 완벽한 룩을 찾아보세요
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-lg px-8 py-6"
                onClick={scrollToTop}
              >
                상품 둘러보기
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6"
              >
                신규 회원 혜택
              </Button>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>무료 배송</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>무료 반품</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>안전 결제</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
