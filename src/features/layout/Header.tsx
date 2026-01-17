import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { CartDrawer } from '@/features/cart/CartDrawer';

export function Header() {
  const totalItems = useCartStore((state) => state.getTotalItems());

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        <Link to="/" className="logo text-xl font-bold">
          one some
        </Link>
        
        <CartDrawer>
          <button className="relative p-2 -mr-2">
            <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-medium flex items-center justify-center bg-foreground text-background rounded-full">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>
        </CartDrawer>
      </div>
    </header>
  );
}
