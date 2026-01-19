'use client';

import React, { useEffect, useState } from 'react';

export default function AccountSettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
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
      alert('Account updated');
    } catch (e) { alert('Unable to save'); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-xl font-semibold mb-4">Account settings</h1>

        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-1">Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-1">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>

        <div className="flex gap-2">
          <button onClick={save} className="px-3 py-1 bg-indigo-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
}
