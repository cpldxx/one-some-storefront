import { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showBottomNav?: boolean;
}

export function Layout({ children, showHeader = true, showBottomNav = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header />}
      <main className={`${showBottomNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}
