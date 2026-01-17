import { Search, Bell, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 container mx-auto">
        <Link to="/" className="logo text-xl font-bold">
          one some
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
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Search className="w-5 h-5 text-gray-700" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-700" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <User className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
    </header>
  );
}
