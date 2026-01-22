"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useNavigation } from "./NavigationProvider";

export function PageTransition() {
  const pathname = usePathname();
  const { isNavigating, setNavigating } = useNavigation();

  useEffect(() => {
    // When pathname changes, navigation is complete
    setNavigating(false);
  }, [pathname, setNavigating]);

  if (!isNavigating) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
