'use client';

import React, { useState } from 'react';

// ---- Registration components (à placer si besoin dans /app/register/page.jsx) ----

export default function RegisterPage() {
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as string | null);

  const validate = () => {
    if (!email || !password || !name) return 'Please fill all required fields.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirm) return 'Passwords do not match.';
    return null;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) return setError(v);
    setLoading(true);
    try {
      const url = 'http://localhost:4000/graphql';
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
          mutation Register($input: RegisterInput!) {
          register(input: $input) {
            token
            user {
              id
              email
              name
              avatar
              createdAt
              updatedAt
            }
          }
        }
        `,
          variables: {
            input: {
              email: email,
              name: name,
              password: password,
              companyName: company,
            },
          },
        }),
      });

      // parse body to show server error message when present
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        const msg = data?.error || 'Unable to create account.';
        throw new Error(msg);
      }

      // Save token locally (optional) so client can call backend directly using Authorization header
      try {
        if (data.token && typeof window !== 'undefined') {
          localStorage.setItem('token', data.token);
        }
      } catch {
        // ignore storage errors
      }

      // redirection vers page de succès ou connexion (chemin dans l'app)
      window.location.href = '/auth/register/success';
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error during registration';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-6 bg-gray-50'>
      <div className='max-w-md w-full'>
        <div className='bg-white shadow rounded-2xl p-6'>
          <h2 className='text-black text-lg font-semibold mb-4'>
            Create an account
          </h2>
          <form onSubmit={handleRegister} className='space-y-4'>
            <div>
              <label className='block text-sm text-gray-600'>Full name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className='mt-1 block w-full rounded-md border-2 border-grey-300 text-black p-2'
                placeholder='John Doe'
              />
            </div>

            <div>
              <label className='block text-sm text-gray-600'>
                Workspace / company (optional)
              </label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className='mt-1 block w-full rounded-md border-2 border-grey-300 text-black p-2'
                placeholder='My workspace'
              />
            </div>

            <div>
              <label className='block text-sm text-gray-600'>
                Email address
              </label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='mt-1 block w-full rounded-md border-2 border-grey-300 text-black p-2'
                placeholder='you@example.com'
              />
            </div>

            <div>
              <label className='block text-sm text-gray-600'>Password</label>
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className='mt-1 block w-full rounded-md border-2 border-grey-300 text-black p-2'
                placeholder='••••••••'
              />
            </div>

            <div>
              <label className='block text-sm text-gray-600'>
                Confirm password
              </label>
              <input
                type='password'
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className='mt-1 block w-full rounded-md border-2 border-grey-300 text-black p-2'
                placeholder='••••••••'
              />
            </div>

            {error && <div className='text-red-600 text-sm'>{error}</div>}

            <div>
              <button
                type='submit'
                disabled={loading}
                className='w-full rounded-lg px-4 py-2 bg-indigo-600 text-white'
              >
                {loading ? 'Creating...' : 'Create my account'}
              </button>
            </div>

            <p className='text-sm text-gray-600 text-center'>
              By creating an account, you accept our terms.
            </p>
          </form>
        </div>

        <p className='text-center text-sm text-gray-600 mt-4'>
          Already have an account?{' '}
          <a href='/login' className='text-indigo-600'>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

// success page moved to /app/register/success/page.tsx
