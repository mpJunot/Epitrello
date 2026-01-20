'use client';

import React, { useState } from 'react';
import { toast } from '@/lib/toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AccountSettingsPage() {
  const [name, setName] = useState(() => {
    try {
      const raw = localStorage.getItem('epitrello_user');
      const u = raw ? JSON.parse(raw) : null;
      return u?.name || '';
    } catch {
      return '';
    }
  });
  const [email, setEmail] = useState(() => {
    try {
      const raw = localStorage.getItem('epitrello_user');
      if (raw) {
        const u = JSON.parse(raw);
        setTimeout(() => {
        setName(u.name || '');
        setEmail(u.email || '');
      }, 0);

      }
    } catch (e) {}
  }, []);

  const save = () => {
    try {
      const raw = localStorage.getItem('epitrello_user');
      const u = raw ? JSON.parse(raw) : {};
      const next = { ...u, name, email };
      localStorage.setItem('epitrello_user', JSON.stringify(next));
      toast.success('Account updated');
    } catch {
      toast.error('Unable to save');
    }
  };

  return (
    <div className="min-h-screen bg-trello-hover p-6">
      <div className="max-w-2xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-xl font-semibold mb-4">Account settings</h1>

        <div className="mb-4 space-y-2">
          <Label>Full name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="mb-4 space-y-2">
          <Label>Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="flex gap-2">
          <Button onClick={save}>Save</Button>
        </div>
      </div>
    </div>
  );
}
