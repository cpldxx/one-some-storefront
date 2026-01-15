import { User, Package, Heart, Settings, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/features/layout/Layout';
import { useLikedStore } from '@/stores/likedStore';
import { useCartStore } from '@/stores/cartStore';

const menuItems = [
  { icon: Package, label: 'Order History', path: '/orders', description: 'Track your orders' },
  { icon: Heart, label: 'Liked Items', path: '/likes', description: 'Your saved items' },
  { icon: Settings, label: 'Settings', path: '/settings', description: 'App preferences' },
];

export default function MyPage() {
  const likedCount = useLikedStore((state) => state.likedProductIds.length);
  const cartItemsCount = useCartStore((state) => state.getTotalItems());

  return (
    <Layout>
      <div className="px-4 py-6">
        {/* Profile Section */}
        <div className="flex items-center gap-4 pb-6 border-b border-border">
          <div className="w-16 h-16 rounded-full bg-grey-100 flex items-center justify-center">
            <User className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-base font-medium">Welcome</h1>
            <p className="text-sm text-muted-foreground">Sign in for full experience</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 py-6 border-b border-border">
          <div className="flex-1 text-center">
            <p className="text-xl font-medium">{likedCount}</p>
            <p className="text-xs text-muted-foreground">Likes</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 text-center">
            <p className="text-xl font-medium">{cartItemsCount}</p>
            <p className="text-xs text-muted-foreground">In Bag</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 text-center">
            <p className="text-xl font-medium">0</p>
            <p className="text-xs text-muted-foreground">Orders</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-4 py-4 border-b border-border"
            >
              <item.icon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </Link>
          ))}
        </div>

        {/* App Info */}
        <div className="pt-8 text-center">
          <p className="logo text-base">one some</p>
          <p className="text-xs text-muted-foreground mt-1">Version 1.0.0</p>
        </div>
      </div>
    </Layout>
  );
}
