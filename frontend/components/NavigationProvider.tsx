"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface NavigationContextType {
  isNavigating: boolean;
  setNavigating: (value: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setNavigating] = useState(false);

  return (
    <NavigationContext.Provider value={{ isNavigating, setNavigating }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
}
