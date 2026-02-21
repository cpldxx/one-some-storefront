import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function Layout({ children, showHeader = true }: LayoutProps) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-background relative">
      {showHeader && <Header />}
      <main className={!isHome && showHeader ? 'pt-14' : ''}>
        {children}
      </main>
    </div>
  );
}
