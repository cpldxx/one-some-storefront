import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function ShopComingSoonSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
            <span className="text-white/70 text-sm font-medium">Coming Soon</span>
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
          </div>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Shopping Experience Awaits
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-300 mb-8">
            Share your style, find inspiration,
            <br />
            and discover everything you love in one place.
          </p>

          {/* Waitlist Section */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors w-full sm:w-96"
            />
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 whitespace-nowrap w-full sm:w-auto"
            >
              Join Waitlist
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Coming Soon Details */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-2">2000+</div>
              <p className="text-white/70 text-sm">Products</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-2">50+</div>
              <p className="text-white/70 text-sm">Brands</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-2">∞</div>
              <p className="text-white/70 text-sm">Styles</p>
            </div>
          </div>

          {/* Secondary CTA */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-gray-400 mb-4">Share your style in our community</p>
            <a
              href="/community"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Explore Community
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
