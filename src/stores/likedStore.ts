import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface LikedStore {
  likedProductIds: string[];
  toggleLike: (productId: string) => void;
  isLiked: (productId: string) => boolean;
}

export const useLikedStore = create<LikedStore>()(
  persist(
    (set, get) => ({
      likedProductIds: [],

      toggleLike: (productId) => {
        const { likedProductIds } = get();
        const isCurrentlyLiked = likedProductIds.includes(productId);
        
        if (isCurrentlyLiked) {
          set({ likedProductIds: likedProductIds.filter(id => id !== productId) });
        } else {
          set({ likedProductIds: [...likedProductIds, productId] });
        }
      },

      isLiked: (productId) => {
        return get().likedProductIds.includes(productId);
      },
    }),
    {
      name: 'onesome-liked',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
