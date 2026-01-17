import { motion } from 'framer-motion';
import { useScrollAnimation, staggerContainer, staggerItem } from '@/hooks/use-scroll-animation';
import { Truck, Shield, Headset } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const services = [
  {
    icon: Truck,
    title: '무료 배송',
    description: '50,000원 이상 구매 시 전국 무료 배송',
  },
  {
    icon: Shield,
    title: '품질 보증',
    description: '100% 정품 보증 및 14일 무료 반품',
  },
  {
    icon: Headset,
    title: '고객 지원',
    description: '연중무휴 24시간 고객 상담 서비스',
  },
];

export const ServicesSection = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          variants={staggerContainer}
        >
          {/* 서비스 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div key={index} variants={staggerItem}>
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="pt-6 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {service.title}
                      </h3>
                      <p className="text-gray-600">{service.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
