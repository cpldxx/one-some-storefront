import { motion } from 'framer-motion';
import { useScrollAnimation, fadeIn } from '@/hooks/use-scroll-animation';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail } from 'lucide-react';

export const LandingFooter = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  const footerLinks = {
    shop: [
      { label: 'All Products', to: '/' },
      { label: 'New Arrivals', to: '/' },
      { label: 'Best Sellers', to: '/' },
      { label: 'Sale', to: '/' },
    ],
    help: [
      { label: 'Shipping Info', to: '/' },
      { label: 'Returns & Exchanges', to: '/' },
      { label: 'Terms of Service', to: '/' },
      { label: 'Privacy Policy', to: '/' },
    ],
    about: [
      { label: 'About Us', to: '/' },
      { label: 'Careers', to: '/' },
      { label: 'Store Locator', to: '/' },
      { label: 'Partnership', to: '/' },
    ],
  };

  const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Mail, href: 'mailto:contact@onesome.com', label: 'Email' },
  ];

  return (
    <motion.footer
      ref={ref}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={fadeIn}
      className="bg-gray-900 text-gray-300 py-12"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div>
            <h3 className="text-white text-2xl font-bold mb-4">One Some</h3>
            <p className="text-sm mb-4">
              Complete your unique style with
              <br />
              premium street fashion
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Shop 링크 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help 링크 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Help</h4>
            <ul className="space-y-2">
              {footerLinks.help.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About 링크 */}
          <div>
            <h4 className="text-white font-semibold mb-4">About</h4>
            <ul className="space-y-2">
              {footerLinks.about.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© 2026 One Some. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/" className="hover:text-primary transition-colors">
                이용약관
              </Link>
              <Link to="/" className="hover:text-primary transition-colors">
                개인정보처리방침
              </Link>
              <Link to="/" className="hover:text-primary transition-colors">
                고객센터
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};
