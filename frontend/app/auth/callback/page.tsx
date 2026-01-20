"use client";

import React, { useEffect, useState } from 'react';

export default function OAuthCallbackPage() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      setMessage(decodeURIComponent(error));
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (token) {
      // Exchange token with frontend to set httpOnly cookie
      (async () => {
        try {
          const res = await fetch('/api/auth/exchange', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });

          if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json?.error || 'Exchange failed');
          }

          // Redirect to dashboard (or home)
          window.location.href = '/dashboard';
        } catch (err) {
          setMessage(err instanceof Error ? err.message : 'Unknown error');
        }
      })();
    } else {
      setMessage('No token found in callback');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow">
        <h1 className="text-lg font-semibold mb-2">Authentification Slack</h1>
        {message ? (
          <p className="text-red-600">{message}</p>
        ) : (
          <p>Finalisation de l authentification, redirection...</p>
        )}
      </div>
    </div>
  );
}
