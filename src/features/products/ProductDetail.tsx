import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Heart, Minus, Plus, Loader2 } from 'lucide-react';
import { fetchProductByHandle, formatPrice, CartItem, ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { useLikedStore } from '@/stores/likedStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const { toggleLike, isLiked } = useLikedStore();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', handle],
    queryFn: () => fetchProductByHandle(handle!),
    enabled: !!handle,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground mb-4">Product not found</p>
        <Button variant="outline" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    );
  }

  const images = product.images?.edges || [];
  const options = product.options || [];
  const variants = product.variants?.edges || [];
  const liked = isLiked(product.id);

  // Initialize selected options if not set
  if (Object.keys(selectedOptions).length === 0 && options.length > 0) {
    const initialOptions: Record<string, string> = {};
    options.forEach((opt: { name: string; values: string[] }) => {
      if (opt.values.length > 0) {
        initialOptions[opt.name] = opt.values[0];
      }
    });
    if (Object.keys(initialOptions).length > 0) {
      setSelectedOptions(initialOptions);
    }
  }

  // Find matching variant
  const selectedVariant = variants.find((v: { node: { selectedOptions: Array<{ name: string; value: string }> } }) => {
    return v.node.selectedOptions.every(
      (opt: { name: string; value: string }) => selectedOptions[opt.name] === opt.value
    );
  }) || variants[0];

  const price = selectedVariant?.node.price || product.priceRange?.minVariantPrice;
  const isAvailable = selectedVariant?.node.availableForSale !== false;

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    const productWrapper: ShopifyProduct = {
      node: product
    };

    const cartItem: CartItem = {
      product: productWrapper,
      variantId: selectedVariant.node.id,
      variantTitle: selectedVariant.node.title,
      price: selectedVariant.node.price,
      quantity,
      selectedOptions: selectedVariant.node.selectedOptions,
    };

    addItem(cartItem);
    toast.success('Added to bag', {
      position: 'top-center',
      duration: 2000,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between h-12 px-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => toggleLike(product.id)}
            className="p-2 -mr-2"
          >
            <Heart
              className={`w-5 h-5 ${liked ? 'fill-foreground' : ''}`}
              strokeWidth={1.5}
            />
          </button>
        </div>
      </header>

      {/* Image Carousel */}
      <div className="relative bg-grey-100">
        <div className="aspect-[3/4] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={images[currentImageIndex]?.node.url}
              alt={images[currentImageIndex]?.node.altText || product.title}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          </AnimatePresence>
        </div>
        
        {/* Image Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_: unknown, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`carousel-dot ${currentImageIndex === index ? 'active' : ''}`}
              />
            ))}
          </div>
        )}

        {/* Image Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-1 p-3 overflow-x-auto hide-scrollbar">
            {images.map((img: { node: { url: string; altText: string | null } }, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-14 h-14 flex-shrink-0 bg-grey-100 overflow-hidden ${
                  currentImageIndex === index ? 'ring-1 ring-foreground' : ''
                }`}
              >
                <img
                  src={img.node.url}
                  alt={img.node.altText || ''}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="px-4 py-4 space-y-4">
        <div>
          <h1 className="text-lg font-medium">{product.title}</h1>
          <p className="text-base font-medium mt-1">
            {formatPrice(price?.amount || '0', price?.currencyCode || 'CAD')}
          </p>
        </div>

        {/* Options */}
        {options.map((option: { name: string; values: string[] }) => (
          option.values.length > 1 && (
            <div key={option.name}>
              <p className="text-xs text-muted-foreground mb-2">
                {option.name}
              </p>
              <div className="flex flex-wrap gap-2">
                {option.values.map((value: string) => (
                  <button
                    key={value}
                    onClick={() => setSelectedOptions(prev => ({ ...prev, [option.name]: value }))}
                    className={`px-3 py-1.5 text-xs border ${
                      selectedOptions[option.name] === value
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          )
        ))}

        {/* Quantity */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Quantity</p>
          <div className="inline-flex items-center border border-border">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2"
            >
              <Minus className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <span className="w-10 text-center text-sm font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Description</p>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {product.description}
            </p>
          </div>
        )}
      </div>

      {/* Sticky Buy Button */}
      <div className="sticky-buy-btn">
        <Button
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className="w-full h-12 text-sm font-medium"
        >
          {isAvailable ? 'Add to Bag' : 'Sold Out'}
        </Button>
      </div>
    </div>
  );
}
