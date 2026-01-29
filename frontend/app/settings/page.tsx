'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { updateUser } from '@/lib/actions/users';
import { useCurrentUserQuery, currentUserQueryKey } from '@/lib/queries/users';

export default function AccountSettingsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: user, isLoading: loading } = useCurrentUserQuery();

  useEffect(() => {
    if (user) {
      setUserId(user.id);
      setName(user.name || '');
      setEmail(user.email || '');
    } else if (user === null && !loading) {
      toast.error('Failed to load user information');
    }
  }, [user, loading]);

  const save = async () => {
    if (!userId) {
      toast.error('User ID not found');
      return;
    }

    setSaving(true);
    try {
      await updateUser(userId, { name, email });
      await queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
      toast.success('Account updated');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save';
      toast.error(message);
      console.error('Failed to update user', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full">
        <div className="px-6 py-4 w-full max-w-4xl space-y-6">
          <div className="space-y-1">
            <Skeleton className="h-8 w-48" />
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
            <Separator />
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-9 w-full" />
            </div>
            <Separator />
            <div className="flex justify-start">
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <div className="px-6 py-4 w-full max-w-4xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Account settings</h1>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              placeholder="Enter your full name"
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={saving}
              placeholder="Enter your email address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              disabled
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground"
              defaultValue="en"
              aria-describedby="language-helper"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
            </select>
            <p id="language-helper" className="text-xs text-muted-foreground">Language selection placeholder (disabled for now).</p>
          </div>

          <Separator />

          <div className="flex justify-start">
            <Button onClick={save} disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
