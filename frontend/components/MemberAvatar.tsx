"use client";

import React from "react";

export default function MemberAvatar({ user, size = 8 }: { user: { id: string; name?: string; avatar?: string; email?: string }; size?: number }) {
  const initials = user.name ? user.name.split(" ").map((s) => s[0]).slice(0,2).join("") : (user.email || "U")[0].toUpperCase();
  const dim = `${size}rem`;
  return (
    <div title={user.name || user.email} className="rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-700" style={{ width: dim, height: dim }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" /> : initials}
    </div>
  );
}
