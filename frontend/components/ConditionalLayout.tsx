'use client';

import { usePathname } from 'next/navigation';
import Topbar from './Topbar';
import AppSidebar from './Sidebar';
import { SidebarInset } from '@/components/ui/sidebar';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = pathname === '/' || pathname?.startsWith('/auth');
  const isBoardView =
    pathname?.startsWith('/boards/') && pathname?.match(/^\/boards\/[^/]+$/);

  if (isPublicPage) {
    return <div className='w-full min-h-screen'>{children}</div>;
  }

  return (
    <div className='flex h-screen w-full'>
      <AppSidebar />
      <SidebarInset
        className={`flex flex-col bg-background w-full min-w-0 ${isBoardView ? 'overflow-hidden' : ''}`}
      >
        <Topbar />
        <main
          className={`flex-1 w-full ${isBoardView ? 'h-full overflow-hidden' : 'overflow-y-auto'}`}
        >
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}
