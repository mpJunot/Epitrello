'use client';
import { useState } from 'react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('token')
      : null;

  const validate = () => {
    if (!password || !confirm) return 'Please fill all fields.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirm) return 'Passwords do not match.';
    if (!token) return 'Missing token — the link is invalid or expired.';
    return null;
  };

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) return setError(validationError);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok)
        throw new Error('Unable to reset password. The link may be expired.');
      // redirect to success page
      window.location.href = '/auth/reset/success';
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error during password reset';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-6 bg-gray-50'>
      <div className='max-w-md w-full'>
        <div className='bg-white shadow rounded-2xl p-6'>
          <h2 className='text-lg font-semibold mb-4'>Reset password</h2>

          <form onSubmit={handleReset} className='space-y-4'>
            <div>
              <label className='block text-sm'>New password</label>
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className='mt-1 block w-full rounded-md border border-black p-2 focus:border-black focus:ring-black'
                placeholder='••••••••'
              />
            </div>

            <div>
              <label className='block text-sm'>Confirm password</label>
              <input
                type='password'
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className='mt-1 block w-full rounded-md border border-black p-2 focus:border-black focus:ring-black'
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
                {loading ? 'Resetting...' : 'Reset password'}
              </button>
            </div>

            <p className='text-sm text-gray-500 text-center'>
              Back to{' '}
              <a href='/login' className='text-indigo-600'>
                login
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
