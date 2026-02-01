'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { setAuthToken, setAuthTokenCookie } from '@/lib/graphql-client';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';

const LoginSchema = z.object({
  email: z.string().min(1, 'Email required').email('Invalid email'),
  password: z.string().min(8, 'Password must contain at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof LoginSchema>;

/** Hostnames the browser cannot reach (e.g. Docker service names). For these we use localhost:4000 for OAuth when frontend runs on localhost. */
const BROWSER_UNREACHABLE_HOSTS = ['postgres', 'backend', 'api', '0.0.0.0'];

/** Backend base URL for OAuth redirect. Uses NEXT_PUBLIC_API_URL (without /graphql); only falls back to localhost:4000 when the API host is unreachable from the browser (e.g. "postgres"). */
function getOAuthBackendUrl(): string {
  if (typeof window === 'undefined') return 'http://localhost:4000';
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';
  let backend =
    apiUrl.replace(/\/graphql\/?$/, '').trim() || apiUrl.replace(/\/$/, '');
  try {
    const host = new URL(backend).hostname;
    if (BROWSER_UNREACHABLE_HOSTS.includes(host)) {
      backend = 'http://localhost:4000';
    }
  } catch {
    backend = 'http://localhost:4000';
  }
  return backend;
}

function LoginFormContent() {
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    const url =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';

    console.log('[Login] Starting login request', {
      url,
      email: data.email,
      hasPassword: !!data.password,
      rememberMe: data.rememberMe,
      envVar: process.env.NEXT_PUBLIC_API_URL,
    });

    try {
      const requestBody = {
        query: `mutation Login($input: LoginInput!) {\n  login(input: $input) {\n    token\n    user { id email name avatar createdAt updatedAt }\n  }\n}\n`,
        variables: {
          input: {
            email: data.email,
            password: data.password,
            rememberMe: data.rememberMe || false,
          },
        },
      };

      console.log('[Login] Sending request', {
        url,
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('[Login] Response received', {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        headers: Object.fromEntries(res.headers.entries()),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('[Login] HTTP Error', {
          status: res.status,
          statusText: res.statusText,
          body: text,
        });
        throw new Error(text || 'Erreur réseau');
      }

      const json = await res.json();
      console.log('[Login] Response body', {
        hasData: !!json.data,
        hasErrors: !!json.errors,
        errors: json.errors,
      });

      if (json.errors && json.errors.length) {
        console.error('[Login] GraphQL Errors', json.errors);
        throw new Error(json.errors[0].message || 'GraphQL error');
      }

      // Store the token
      if (json.data?.login?.token) {
        console.log(
          '[Login] Login successful, storing token in localStorage and cookie',
        );
        setAuthToken(json.data.login.token);
        setAuthTokenCookie(json.data.login.token);
      } else {
        console.warn('[Login] No token in response', json.data);
      }

      // Redirect to next URL if valid (same-origin path), else dashboard
      const target =
        nextUrl &&
        nextUrl.startsWith('/') &&
        !nextUrl.startsWith('//') &&
        !nextUrl.includes('http')
          ? nextUrl
          : '/dashboard';
      console.log('[Login] Redirecting to', target);
      window.location.href = target;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      console.error('[Login] Error occurred', {
        error: err,
        message: errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
      });
      toast.error(errorMessage, 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex w-full'>
      {/* Left: brand / illustration */}
      <div className='hidden md:flex w-1/2 bg-linear-to-b from-(--trello-blue) to-(--trello-blue-hover) items-center justify-center p-12'>
        <div className='max-w-lg text-white flex flex-col justify-center h-full'>
          {/* Brand section */}
          <div className='mb-12'>
            <div className='flex items-center gap-4 mb-4'>
              <div className='h-14 w-14 rounded-full bg-white/30 flex items-center justify-center text-3xl font-bold text-white shadow-lg'>
                E
              </div>
              <div>
                <h1 className='text-4xl font-bold text-white mb-2'>
                  Epitrello
                </h1>
                <p className='text-base text-white/90 leading-relaxed'>
                  Back-office for merchants — log in to access your dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Content section */}
          <div className='space-y-6'>
            <div>
              <h2 className='text-3xl font-bold text-white mb-3'>
                Manage your products and orders
              </h2>
              <p className='text-lg text-white/95 leading-relaxed'>
                View statistics, add products, and configure your store.
              </p>
            </div>

            <div className='pt-4'>
              <ul className='space-y-3 text-base text-white/95'>
                <li className='flex items-start gap-3'>
                  <span className='text-white text-xl leading-none mt-1'>
                    •
                  </span>
                  <span>Real-time dashboard</span>
                </li>
                <li className='flex items-start gap-3'>
                  <span className='text-white text-xl leading-none mt-1'>
                    •
                  </span>
                  <span>Product management</span>
                </li>
                <li className='flex items-start gap-3'>
                  <span className='text-white text-xl leading-none mt-1'>
                    •
                  </span>
                  <span>Order history</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className='flex flex-1 items-center justify-center p-8 bg-trello-card-bg'>
        <div className='max-w-md w-full'>
          <div className='mb-6 md:hidden text-center'>
            <div className='mx-auto h-12 w-12 rounded-full bg-trello-blue flex items-center justify-center text-white font-bold'>
              E
            </div>
            <h1 className='mt-3 text-xl font-semibold text-trello'>
              Epitrello
            </h1>
            <p className='text-sm text-trello-secondary'>
              Sign in to your account
            </p>
          </div>

          <div className='bg-trello-card-bg shadow-lg rounded-2xl p-6'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email address</Label>
                <Input
                  id='email'
                  type='email'
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                  placeholder='you@example.com'
                />
                {errors.email && (
                  <p className='text-red-600 text-sm mt-1'>
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`pr-20 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder='••••••••'
                    aria-label='Password'
                  />
                  {errors.password && (
                    <p className='text-red-600 text-sm mt-1'>
                      {errors.password.message}
                    </p>
                  )}
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => setShowPassword((s) => !s)}
                    className='absolute right-2 top-1/2 -translate-y-1/2'
                    aria-pressed={showPassword}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className='w-4 h-4' />
                    ) : (
                      <Eye className='w-4 h-4' />
                    )}
                  </Button>
                </div>
              </div>

              <div className='flex items-center justify-between text-sm'>
                <div className='flex items-center gap-2'>
                  <Checkbox id='rememberMe' {...register('rememberMe')} />
                  <Label
                    htmlFor='rememberMe'
                    className='text-sm font-medium text-trello-secondary cursor-pointer'
                  >
                    Remember me
                  </Label>
                </div>
                <a
                  href='/auth/forgot'
                  className='text-trello-blue hover:underline'
                >
                  Forgot password?
                </a>
              </div>

              <div>
                <Button type='submit' disabled={loading} className='w-full'>
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>

              <div className='flex items-center gap-2'>
                <div className='flex-1 h-px bg-trello-border' />
                <div className='text-xs text-trello-secondary uppercase'>
                  or
                </div>
                <div className='flex-1 h-px bg-trello-border' />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={(e) => {
                    e.preventDefault();
                    const backend = getOAuthBackendUrl();
                    window.location.href = `${backend}/auth/google`;
                  }}
                  className='w-full'
                >
                  <svg className='w-4 h-4 mr-2' viewBox='0 0 24 24'>
                    <path
                      fill='#4285F4'
                      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                    />
                    <path
                      fill='#34A853'
                      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                    />
                    <path
                      fill='#FBBC05'
                      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                    />
                    <path
                      fill='#EA4335'
                      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                    />
                  </svg>
                  <span className='text-sm'>Google</span>
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={(e) => {
                    e.preventDefault();
                    const backend = getOAuthBackendUrl();
                    window.location.href = `${backend}/auth/microsoft`;
                  }}
                  className='w-full'
                >
                  <svg className='w-4 h-4 mr-2' viewBox='0 0 23 23' fill='none'>
                    <path d='M0 0h10.892v10.892H0V0z' fill='#F25022' />
                    <path d='M12.108 0H23v10.892H12.108V0z' fill='#7FBA00' />
                    <path d='M0 12.108h10.892V23H0V12.108z' fill='#00A4EF' />
                    <path
                      d='M12.108 12.108H23V23H12.108V12.108z'
                      fill='#FFB900'
                    />
                  </svg>
                  <span className='text-sm'>Microsoft</span>
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={(e) => {
                    e.preventDefault();
                    const backend = getOAuthBackendUrl();
                    window.location.href = `${backend}/auth/apple`;
                  }}
                  className='w-full'
                >
                  <svg
                    className='w-4 h-4 mr-2'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                  >
                    <path d='M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z' />
                  </svg>
                  <span className='text-sm'>Apple</span>
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={(e) => {
                    e.preventDefault();
                    const backend = getOAuthBackendUrl();
                    window.location.href = `${backend}/auth/slack`;
                  }}
                  className='w-full'
                >
                  <svg
                    className='w-4 h-4 mr-2'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                  >
                    <path d='M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 5.042a2.528 2.528 0 0 1-2.52-2.52A2.528 2.528 0 0 1 18.956 0a2.528 2.528 0 0 1 2.523 2.522v2.52h-2.523zM18.956 6.313a2.528 2.528 0 0 1 2.523 2.521 2.528 2.528 0 0 1-2.523 2.521h-6.313A2.528 2.528 0 0 1 10.12 8.834a2.528 2.528 0 0 1 2.523-2.521h6.313zM15.165 18.956a2.528 2.528 0 0 1 2.522 2.523A2.528 2.528 0 0 1 15.165 24a2.528 2.528 0 0 1-2.52-2.522v-2.523h2.52zM13.895 18.956a2.528 2.528 0 0 1-2.521-2.523 2.528 2.528 0 0 1 2.521-2.52h6.313A2.528 2.528 0 0 1 24 16.433a2.528 2.528 0 0 1-2.522 2.523h-6.583z' />
                  </svg>
                  <span className='text-sm'>Slack</span>
                </Button>
              </div>

              <p className='text-center text-sm text-trello-secondary mt-2'>
                Don&apos;t have an account?{' '}
                <a
                  href='/auth/register/'
                  className='text-trello-blue hover:underline'
                >
                  Create an account
                </a>
              </p>
            </form>
          </div>

          <p className='text-xs text-trello-secondary text-center mt-4'>
            By signing in, you agree to the terms of use and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center bg-trello-card-bg'>
          <div className='animate-pulse text-trello-secondary'>Loading...</div>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
