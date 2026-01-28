import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '../components/ui/sonner';
import { ThemeProvider } from '../components/theme-provider';
import { QueryProvider } from '../components/providers/QueryProvider';
import { ConditionalLayout } from '../components/ConditionalLayout';
import { PageTransition } from '../components/PageTransition';
import { NavigationProvider } from '../components/NavigationProvider';
import { SidebarProvider } from '../components/ui/sidebar';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Epitrello',
  description:
    'Epitrello is a project management tool that helps you manage your projects and tasks.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning className='min-h-full w-full'>
      <body
        className={`${inter.variable} font-sans antialiased min-h-full w-full overflow-x-hidden`}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <SidebarProvider className='w-full h-full'>
              <NavigationProvider>
                <PageTransition />
                <ConditionalLayout>{children}</ConditionalLayout>
                <Toaster />
              </NavigationProvider>
            </SidebarProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
