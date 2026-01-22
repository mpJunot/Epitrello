"use client";

import Link, { LinkProps } from "next/link";
import { useNavigation } from "./NavigationProvider";
import { ReactNode } from "react";

export function NavigationLink({
  href,
  children,
  className,
  ...props
}: LinkProps & { children: ReactNode; className?: string }) {
  const { setNavigating } = useNavigation();

  const handleClick = () => {
    setNavigating(true);
  };

  return (
    <Link href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  );
}
