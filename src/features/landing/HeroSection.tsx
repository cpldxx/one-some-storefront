import { useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const heroSlides = [
  {
    badge: '🔥 2026 신상품 출시',
    title: '새로운 스타일,',
    subtitle: '새로운 시작',
    description: '50,000원 이상 구매 시 무료배송',
    bgGradient: 'from-gray-900 to-gray-800',
    textColor: 'text-white',
    logoText: 'ONE',
  },
  {
    badge: '⚡ 한정 세일',
    title: '지금만 특별한',
    subtitle: '최대 50% 할인',
    description: '이번 주말까지 한정 특가',
    bgGradient: 'from-blue-900 to-blue-800',
    textColor: 'text-white',
    logoText: 'SALE',
  },
  {
    badge: '✨ 신규 회원 혜택',
    title: '첫 구매 고객을 위한',
    subtitle: '5,000원 적립금',
    description: '회원가입 즉시 사용 가능',
    bgGradient: 'from-purple-900 to-purple-800',
    textColor: 'text-white',
    logoText: 'NEW',
  },
  {
    badge: '🎁 무료 배송',
    title: '배송비 걱정 없이',
    subtitle: '편하게 쇼핑하세요',
    description: '전 상품 무료 배송 진행 중',
    bgGradient: 'from-emerald-900 to-emerald-800',
    textColor: 'text-white',
    logoText: 'FREE',
  },
  {
    badge: '🏆 베스트 셀러',
    title: '지금 가장 핫한',
    subtitle: '인기 아이템',
    description: '매주 업데이트되는 베스트 컬렉션',
    bgGradient: 'from-orange-900 to-orange-800',
    textColor: 'text-white',
    logoText: 'BEST',
  },
];

export const HeroSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  );

  const scrollToProducts = () => {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    
    emblaApi.on('select', onSelect);
    onSelect();
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return (
    <section ref={ref} className="relative bg-white pt-4 pb-8">
      <div className="container mx-auto px-4">
        <div className="relative rounded-2xl overflow-hidden">
          {/* Embla Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {heroSlides.map((slide, index) => (
                <div key={index} className="flex-[0_0_100%] min-w-0">
                  <div
                    className={`relative bg-gradient-to-r ${slide.bgGradient} h-[500px] md:h-[600px]`}
                  >
                    {/* 배경 패턴 */}
                    <div className="absolute inset-0 opacity-10">
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                          backgroundSize: '40px 40px',
                        }}
                      />
                    </div>

                    {/* 컨텐츠 */}
                    <div className="relative h-full flex items-center">
                      <div className="w-full md:w-1/2 px-8 md:px-16 z-10">
                        {/* 뱃지 */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={isVisible ? { opacity: 1, y: 0 } : {}}
                          transition={{ delay: 0.2 }}
                          className="inline-block mb-4"
                        >
                          <span className="bg-white/20 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm">
                            {slide.badge}
                          </span>
                        </motion.div>

                        {/* 메인 헤드라인 */}
                        <motion.h1
                          initial={{ opacity: 0, y: 20 }}
                          animate={isVisible ? { opacity: 1, y: 0 } : {}}
                          transition={{ delay: 0.3 }}
                          className={`text-4xl md:text-6xl font-bold ${slide.textColor} mb-4 leading-tight`}
                        >
                          {slide.title}
                          <br />
                          {slide.subtitle}
                        </motion.h1>

                        {/* 서브텍스트 */}
                        <motion.p
                          initial={{ opacity: 0, y: 20 }}
                          animate={isVisible ? { opacity: 1, y: 0 } : {}}
                          transition={{ delay: 0.4 }}
                          className="text-lg md:text-xl text-gray-300 mb-8"
                        >
                          {slide.description}
                        </motion.p>

                        {/* CTA 버튼 */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={isVisible ? { opacity: 1, y: 0 } : {}}
                          transition={{ delay: 0.5 }}
                        >
                          <Button
                            size="lg"
                            className="bg-white text-gray-900 hover:bg-gray-100 text-base px-8 py-6 group"
                            onClick={scrollToProducts}
                          >
                            지금 쇼핑하기
                            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </motion.div>
                      </div>

                      {/* 로고 텍스트 (오른쪽) */}
                      <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={isVisible ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.4 }}
                        className="hidden md:block absolute right-0 top-0 bottom-0 w-1/2"
                      >
                        <div className="relative h-full flex items-center justify-center">
                          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 backdrop-blur-sm rounded-full" />
                          <div className="relative text-white/20 text-9xl font-bold">
                            {slide.logoText}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-2 rounded-full transition-all ${
                  index === selectedIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 w-2 hover:bg-white/75'
                }`}
                aria-label={`슬라이드 ${index + 1}로 이동`}
              />
            ))}
          </div>
        </div>

        {/* 프로모션 바 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">무료배송</div>
            <div className="text-sm text-gray-600 mt-1">5만원 이상 구매시</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">무료반품</div>
            <div className="text-sm text-gray-600 mt-1">14일 이내</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">신규회원</div>
            <div className="text-sm text-gray-600 mt-1">5,000원 적립금 지급</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
