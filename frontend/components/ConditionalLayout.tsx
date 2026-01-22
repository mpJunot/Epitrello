"use client";

import { usePathname } from "next/navigation";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = pathname === "/" || pathname?.startsWith("/auth");

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Topbar />
      <div className="flex min-h-[calc(100vh-56px)]">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </>
  );
}
