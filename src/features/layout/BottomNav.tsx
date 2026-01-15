import { Home, Search, Heart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLikedStore } from '@/stores/likedStore';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Search', path: '/search' },
  { icon: Heart, label: 'Likes', path: '/likes' },
  { icon: User, label: 'My Page', path: '/mypage' },
];

export function BottomNav() {
  const location = useLocation();
  const likedCount = useLikedStore((state) => state.likedProductIds.length);

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around pt-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          const showBadge = path === '/likes' && likedCount > 0;
          
          return (
            <Link
              key={path}
              to={path}
              className={`nav-item relative ${isActive ? 'active' : ''}`}
            >
              <div className="relative">
                <Icon 
                  className="w-5 h-5" 
                  strokeWidth={isActive ? 2 : 1.5}
                  fill={isActive && path === '/likes' ? 'currentColor' : 'none'}
                />
                {showBadge && (
                  <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 text-[9px] font-medium flex items-center justify-center bg-foreground text-background rounded-full">
                    {likedCount > 9 ? '9+' : likedCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-foreground rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
