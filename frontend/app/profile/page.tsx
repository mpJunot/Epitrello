"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser, type User } from "@/lib/actions/users";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const me = await getCurrentUser();
        setUser(me);
      } catch (error) {
        console.error("Failed to load profile", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const content = loading ? (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2 w-full max-w-sm">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Separator />
      <div className="grid gap-4 max-w-xl">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  ) : (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user?.avatar} alt={user?.name || "User avatar"} />
          <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="text-lg font-semibold">{user?.name || "Unknown user"}</p>
          <p className="text-sm text-muted-foreground">{user?.email || "No email available"}</p>
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 max-w-xl">
        <div className="space-y-2">
          <Label htmlFor="profile-name">Full name</Label>
          <Input
            id="profile-name"
            value={user?.name || ""}
            readOnly
            aria-readonly
            disabled
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input
            id="profile-email"
            type="email"
            value={user?.email || ""}
            readOnly
            aria-readonly
            disabled
          />
        </div>
      </div>
    </div>
  );

  return (
    <main className="p-6 w-full h-full overflow-auto">
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-semibold">Profile and visibility</h1>
        <p className="text-sm text-muted-foreground">View your account details. Fields are read-only.</p>
      </div>

      {content}
    </main>
  );
}
