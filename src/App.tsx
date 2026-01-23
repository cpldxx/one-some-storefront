import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Community from "./pages/Community";
import PostDetail from "./pages/PostDetail";
import ShopPage from "./pages/ShopPage";
import ProductPage from "./pages/ProductPage";
import LikesPage from "./pages/LikesPage";
import MyPage from "./pages/MyPage";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
      gcTime: 1000 * 60 * 30, // 30분간 캐시 유지
      refetchOnWindowFocus: false, // 창 포커스 시 재요청 안함
      retry: (failureCount, error: any) => {
        // AbortError는 재시도하지 않음
        if (error?.name === 'AbortError' || error?.message?.includes('AbortError')) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/:postId" element={<PostDetail />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:handle" element={<ProductPage />} />
          <Route path="/likes" element={<LikesPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/orders" element={<MyPage />} />
          <Route path="/settings" element={<MyPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
