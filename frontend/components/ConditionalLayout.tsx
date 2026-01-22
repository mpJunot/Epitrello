"use client";

import { usePathname } from "next/navigation";
import Topbar from "./Topbar";
import AppSidebar from "./Sidebar";
import { SidebarInset } from "@/components/ui/sidebar";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = pathname === "/" || pathname?.startsWith("/auth");

  if (isPublicPage) {
    return <div className="w-full h-full min-h-screen">{children}</div>;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-hidden bg-background w-full min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto w-full">{children}</main>
      </SidebarInset>
    </div>
  );
}
