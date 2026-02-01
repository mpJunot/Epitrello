'use client';

import React, { useEffect } from 'react';
import { setAuthToken, setAuthTokenCookie } from '@/lib/graphql-client';
import { toast } from '@/lib/toast';

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
  useEffect(() => {
    const { token, error } = getTokenFromUrl();

    if (error) {
      toast.error(error, 'Authentication error');
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (token) {
      setAuthToken(token);
      setAuthTokenCookie(token);
      window.history.replaceState({}, document.title, window.location.pathname);

      (async () => {
        try {
          const res = await fetch('/api/auth/exchange', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
            credentials: 'include',
          });

          if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json?.error || 'Exchange failed');
          }

          if (
            typeof window !== 'undefined' &&
            localStorage.getItem('auth_token') !== token
          ) {
            toast.error('Session could not be saved. Please try again.');
            return;
          }
          window.location.href = '/dashboard';
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Unknown error');
        }
      })();
    } else {
      toast.error('No token found in callback');
    }
  }, []);

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='max-w-md w-full p-6 bg-white rounded-lg shadow'>
        <h1 className='text-lg font-semibold mb-2'>OAuth authentication</h1>
        <p>Completing authentication, redirecting...</p>
      </div>
    </div>
  );
}
