import { useState, useEffect } from 'react';
import { User, LogOut, LogIn, ChevronDown } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // 로그인 상태 감지
  useEffect(() => {
    // 현재 유저 확인
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowDropdown(false);
    alert('로그아웃 되었습니다!');
    navigate('/');
  };

  const handleLogin = () => {
    setShowDropdown(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-14 px-4 container mx-auto">
        <Link 
          to="/" 
          className="flex items-center"
        >
          <img src="/logo.png" alt="one some" className="h-8" />
        </Link>
        
        {/* Center Navigation */}
        <nav className="flex items-center gap-8">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors ${
              location.pathname === '/' 
                ? 'text-gray-900 border-b-2 border-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/community" 
            className={`text-sm font-medium transition-colors ${
              location.pathname === '/community' 
                ? 'text-gray-900 border-b-2 border-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Community
          </Link>
          <Link 
            to="/shop" 
            className={`text-sm font-medium transition-colors ${
              location.pathname === '/shop' 
                ? 'text-gray-900 border-b-2 border-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Shop
          </Link>
        </nav>
        
        {/* Right Icons */}
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {user ? (
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            ) : (
              <User className="w-5 h-5 text-gray-700" />
            )}
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              {/* 배경 클릭 시 닫기 */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowDropdown(false)} 
              />
              
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded-lg shadow-lg z-50 py-1">
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-500">로그인됨</p>
                    </div>
                    <Link
                      to="/mypage"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4" />
                      마이페이지
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      로그아웃
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <LogIn className="w-4 h-4" />
                    로그인 / 회원가입
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
