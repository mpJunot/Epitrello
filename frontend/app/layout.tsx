import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "../components/ui/toaster";
import { ThemeProvider } from "../components/theme-provider";
import { ConditionalLayout } from "../components/ConditionalLayout";
import { PageTransition } from "../components/PageTransition";
import { NavigationProvider } from "../components/NavigationProvider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Epitrello",
  description: "Epitrello is a project management tool that helps you manage your projects and tasks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NavigationProvider>
            <PageTransition />
            <ConditionalLayout>{children}</ConditionalLayout>
            <Toaster />
          </NavigationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
