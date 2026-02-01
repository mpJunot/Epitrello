'use client';

import React, { useState } from 'react';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const graphqlEndpoint =
        (process.env.NEXT_PUBLIC_API_URL as string) ||
        'http://localhost:4000/graphql';

      const query = `mutation ForgotPassword($input: ForgotPasswordInput!) {\n        forgotPassword(input: $input) { message }\n      }`;

      const res = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { input: { email } } }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Server error: ${res.status}`);
      }

      const json = await res.json();
      if (json.errors && json.errors.length) {
        throw new Error(json.errors[0].message || 'GraphQL error');
      }

      const messageText =
        json.data?.forgotPassword?.message ||
        'If an account exists for this email, you will receive a reset link.';
      toast.success(messageText, 'Email sent');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error while sending reset email';
      toast.error(errorMessage, 'Forgot password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-6 bg-trello-hover'>
      <div className='max-w-md w-full'>
        <div className='bg-trello-card-bg shadow rounded-2xl p-6'>
          <h2 className='text-lg text-black font-semibold mb-4'>
            Forgot password
          </h2>
          <p className='text-sm text-trello-secondary mb-4'>
            Enter the email address associated with your account. We will send
            you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label>Email address</Label>
              <Input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder='you@example.com'
              />
            </div>

            <div>
              <Button type='submit' disabled={loading} className='w-full'>
                {loading ? 'Sending...' : 'Send link'}
              </Button>
            </div>

            <p className='text-sm text-trello-secondary text-center'>
              Back to{' '}
              <a href='/auth/login' className='text-trello-blue'>
                login
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
