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

  const isHome = location.pathname === '/';

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
    alert('Logged out successfully!');
    navigate('/');
  };

  const handleLogin = () => {
    setShowDropdown(false);
    navigate('/login');
  };

  return (
    <header
      className={`top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-auto ${
        isHome
          ? 'absolute bg-transparent'
          : 'fixed bg-white border-b shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between h-14 px-4 container mx-auto">
        <Link 
          to="/" 
          className="flex items-center"
        >
          <img src="/logo.png" alt="one some" className="h-8" />
        </Link>
        
        {/* Center Navigation */}
        <nav className="flex items-center gap-8">
          {[
            { to: '/', label: 'Home' },
            { to: '/community', label: 'Community' },
            { to: '/shop', label: 'Shop' },
          ].map(({ to, label }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`text-sm font-medium transition-colors ${
                  isHome
                    ? isActive
                      ? 'text-white border-b-2 border-white'
                      : 'text-white/80 hover:text-white'
                    : isActive
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-500 hover:text-black'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        
        {/* Right Icons */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center gap-1 p-2 rounded-lg transition-colors ${
              isHome ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            {user ? (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isHome ? 'bg-white text-black' : 'bg-black text-white'
              }`}>
                {user.email?.charAt(0).toUpperCase()}
              </div>
            ) : (
              <User className={`w-5 h-5 ${isHome ? 'text-white' : 'text-gray-700'}`} />
            )}
            <ChevronDown className={`w-4 h-4 ${isHome ? 'text-white/70' : 'text-gray-400'}`} />
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
                      <p className="text-xs text-gray-500">Logged in</p>
                    </div>
                    <Link
                      to="/mypage"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4" />
                      My Page
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <LogIn className="w-4 h-4" />
                    Login / Sign Up
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
