import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/shopify';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface CartDrawerProps {
  children: ReactNode;
}

export function CartDrawer({ children }: CartDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { items, isLoading, updateQuantity, removeItem, createCheckout, getTotalPrice } = useCartStore();
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = getTotalPrice();
  const currencyCode = items[0]?.price.currencyCode || 'CAD';

  const handleCheckout = async () => {
    try {
      const checkoutUrl = await createCheckout();
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full p-0 border-l-0">
        <SheetHeader className="flex-shrink-0 px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-medium">
              Bag ({totalItems})
            </SheetTitle>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 -mr-1"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </SheetHeader>
        
        <div className="flex flex-col flex-1 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-4">
                <p className="text-muted-foreground text-sm">Your bag is empty</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto hide-scrollbar">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.variantId}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-3 p-4 border-b border-border"
                    >
                      <div className="w-20 h-24 bg-grey-100 overflow-hidden flex-shrink-0">
                        {item.product.node.images?.edges?.[0]?.node && (
                          <img
                            src={item.product.node.images.edges[0].node.url}
                            alt={item.product.node.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="text-sm font-medium truncate">
                              {item.product.node.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.selectedOptions.map(opt => opt.value).join(' / ')}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="p-1 -mt-1 -mr-1 text-muted-foreground"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>
                        
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center border border-border">
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              className="p-1.5"
                            >
                              <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                            <span className="w-8 text-center text-xs font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              className="p-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                          </div>
                          
                          <p className="text-sm font-medium">
                            {formatPrice(
                              (parseFloat(item.price.amount) * item.quantity).toString(),
                              item.price.currencyCode
                            )}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              <div className="flex-shrink-0 p-4 border-t border-border bg-background">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm">Total</span>
                  <span className="text-base font-medium">
                    {formatPrice(totalPrice.toString(), currencyCode)}
                  </span>
                </div>
                
                <Button 
                  onClick={handleCheckout}
                  className="w-full h-12 text-sm font-medium" 
                  disabled={items.length === 0 || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Checkout
                      <ExternalLink className="w-4 h-4 ml-2" strokeWidth={1.5} />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
