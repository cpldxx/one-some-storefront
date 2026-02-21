import { useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useNavigate } from 'react-router-dom';

// 이미지 파일을 public 폴더로 복사해야 함
// - street.png → public/images/street.png
// - ai.png → public/images/ai.png
// - street'.png → public/images/street-prime.png (파일명 변경)

const heroSlides = [
  {
    id: 1,
    image: '/images/street.png',
    badge: 'STREET STYLE',
    badgeColor: 'bg-white text-black',
    title: 'URBAN VIBES',
    subtitle: 'Real Street Fashion from Seoul',
    cta: 'Explore',
    link: '/community',
    showContent: true,
  },
  {
    id: 2,
    image: '/images/ai.png',
    badge: 'AI STYLIST',
    badgeColor: 'bg-purple-500 text-white',
    title: 'AI PICK',
    subtitle: 'Personal Style Recommendations',
    cta: 'Try AI',
    link: '/ai-stylist',
    showContent: true,
  },
  {
    id: 3,
    image: '/images/street-prime.png',
    showContent: false,
    imagePosition: 'object-bottom object-[center_15%]',
  },
];

export const HeroSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const navigate = useNavigate();
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

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
    <section ref={ref} className="relative bg-black">
      <div className="relative overflow-hidden">
        {/* Embla Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {heroSlides.map((slide) => (
              <div key={slide.id} className="flex-[0_0_100%] min-w-0">
                <div className="relative h-[75vh] min-h-[550px] max-h-[750px]">
                  {/* Background Image */}
                  <div className="absolute inset-0 bg-gray-900">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className={`w-full h-full ${slide.imagePosition || 'object-top'} object-cover`}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  
                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                  {/* Top gradient for header readability */}
                  <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/50 to-transparent" />

                  {/* Content - 왼쪽 하단 배치 */}
                  <div className="absolute inset-0 flex items-end">
                    <div className="w-full px-6 md:px-16 pb-16 md:pb-20">
                      {slide.showContent !== false && (
                        <>
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={isVisible ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 0.2 }}
                            className="mb-4"
                          >
                            <span className={`inline-block ${slide.badgeColor} text-xs md:text-sm font-bold px-3 py-1.5 uppercase tracking-wider`}>
                              {slide.badge}
                            </span>
                          </motion.div>

                          <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={isVisible ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.3 }}
                            className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-none mb-3"
                          >
                            {slide.title}
                          </motion.h1>

                          <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={isVisible ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.4 }}
                            className="text-base md:text-xl text-gray-300 mb-6 max-w-md"
                          >
                            {slide.subtitle}
                          </motion.p>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isVisible ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.5 }}
                          >
                            <Button
                              size="lg"
                              className="bg-white text-black hover:bg-gray-100 font-bold text-sm md:text-base px-8 py-6 rounded-none group"
                              onClick={() => navigate(slide.link)}
                            >
                              {slide.cta}
                              <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </motion.div>
                        </>
                      )}
                    </div>
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
              className={`h-1 rounded-full transition-all duration-300 ${
                index === selectedIndex
                  ? 'bg-white w-8'
                  : 'bg-white/40 w-4 hover:bg-white/60'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Slide Counter */}
        <div className="absolute bottom-6 right-6 md:right-16 z-20 text-white/80 text-sm font-medium">
          <span className="text-white font-bold">{String(selectedIndex + 1).padStart(2, '0')}</span>
          <span className="mx-1">/</span>
          <span>{String(heroSlides.length).padStart(2, '0')}</span>
        </div>
      </div>
    </section>
  );
};
