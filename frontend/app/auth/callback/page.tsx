'use client';

import React, { useEffect, useState } from 'react';
import { setAuthToken } from '@/lib/graphql-client';

function getTokenFromUrl(): { token: string | null; error: string | null } {
  if (typeof window === 'undefined') return { token: null, error: null };

  // 1) Query string (backend redirect: ?token=... or ?error=...)
  const params = new URLSearchParams(window.location.search);
  let token = params.get('token');
  const error = params.get('error');

  if (error) {
    return { token: null, error: decodeURIComponent(error) };
  }

  if (token) {
    try {
      token = decodeURIComponent(token);
    } catch {
      token = null;
    }
    if (token) return { token, error: null };
  }

  // 2) Hash (optional: #token=... used by some flows)
  const hash = window.location.hash?.replace(/^#/, '');
  if (hash) {
    const hashParams = new URLSearchParams(hash);
    token = hashParams.get('token');
    if (token) {
      try {
        token = decodeURIComponent(token);
      } catch {
        token = null;
      }
      if (token) return { token, error: null };
    }
  }

  return { token: null, error: null };
}

export default function OAuthCallbackPage() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const { token, error } = getTokenFromUrl();

    if (error) {
      setMessage(error);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (token) {
      setAuthToken(token);
      // Remove token from URL immediately (security + avoid refresh re-use)
      window.history.replaceState({}, document.title, window.location.pathname);

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
    <div className='min-h-screen flex items-center justify-center'>
      <div className='max-w-md w-full p-6 bg-white rounded-lg shadow'>
        <h1 className='text-lg font-semibold mb-2'>Authentification Slack</h1>
        {message ? (
          <p className='text-red-600'>{message}</p>
        ) : (
          <p>Finalisation de l authentification, redirection...</p>
        )}
      </div>
    </div>
  );
}
