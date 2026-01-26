"use client";

import { useEffect } from "react";

export default function TokenSync() {
  useEffect(() => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const hasCookie = document.cookie
        .split("; ")
        .some((c) => c.startsWith("auth_token="));

      if (!hasCookie) {
        document.cookie = `auth_token=${token}; path=/; SameSite=Lax; max-age=2592000`;
      }
    } catch {
      // no-op
    }
  }, []);

  return null;
}
