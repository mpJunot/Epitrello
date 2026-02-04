"use client";

import React from "react";
import Image from "next/image";

export default function MemberAvatar({ user, size = 8 }: { user: { id: string; name?: string; avatar?: string; email?: string }; size?: number }) {
  const initials = user.name ? user.name.split(" ").map((s) => s[0]).slice(0,2).join("") : (user.email || "U")[0].toUpperCase();
  const dim = size * 16;
  return (
    <div title={user.name || user.email} className="rounded-full bg-trello-border flex items-center justify-center text-xs text-trello-secondary overflow-hidden" style={{ width: `${size}rem`, height: `${size}rem` }}>
      {user.avatar ? (
        <Image src={user.avatar} alt={user.name ?? ''} width={dim} height={dim} className="w-full h-full object-cover rounded-full" unoptimized />
      ) : (
        initials
      )}
    </div>
  );
}
