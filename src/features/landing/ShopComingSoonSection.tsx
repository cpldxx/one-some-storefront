import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function ShopComingSoonSection() {
  const brandHighlights = [
    {
      title: 'Authentic Style',
      description: 'Curated fashion from emerging and established brands'
    },
    {
      title: 'Community First',
      description: 'Share your OOTD and connect with fashion enthusiasts'
    },
    {
      title: 'Curated Selection',
      description: 'Handpicked pieces that match your vibe'
    }
  ];

  return (
    <section className="py-12 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-gray-900" />
              <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">One Some Studio</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              One Some Shopping<br />is Coming Soon
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              A fashion community platform where style meets inspiration. We're carefully curating premium brands and emerging designers.
            </p>
          </div>

          {/* Brand Highlights + Waitlist Combined */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {brandHighlights.map((item, idx) => (
              <div key={idx} className="p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <h3 className="text-base font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 font-light">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Waitlist Section */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 mb-8">
            <p className="text-center text-sm text-gray-600 mb-4 font-light">
              Be the first to know when we launch
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors w-full sm:w-80 text-sm"
              />
              <Button
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap w-full sm:w-auto text-sm"
              >
                Get Notified
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-8 pt-8 border-t border-gray-200">
            <a
              href="/community"
              className="inline-flex items-center gap-2 text-gray-900 hover:text-gray-700 font-medium transition-colors"
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
