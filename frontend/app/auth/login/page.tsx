'use client';

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { setAuthToken } from "@/lib/graphql-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LoginSchema = z.object({
  email: z.string().min(1, "Email required").email("Invalid email"),
  password: z.string().min(8, "Password must contain at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    setLoading(true);
    const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql";

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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        throw new Error(text || "Erreur réseau");
      }

      const json = await res.json();
      console.log('[Login] Response body', {
        hasData: !!json.data,
        hasErrors: !!json.errors,
        errors: json.errors,
      });

      if (json.errors && json.errors.length) {
        console.error('[Login] GraphQL Errors', json.errors);
        throw new Error(json.errors[0].message || "GraphQL error");
      }

      // Store the token
      if (json.data?.login?.token) {
        console.log('[Login] Login successful, storing token');
        setAuthToken(json.data.login.token);
      } else {
        console.warn('[Login] No token in response', json.data);
      }

      // Redirect to dashboard
      console.log('[Login] Redirecting to dashboard');
      window.location.href = '/dashboard';
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      console.error('[Login] Error occurred', {
        error: err,
        message: errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex'>
      {/* Left: brand / illustration */}
      <div className='hidden md:flex w-1/2 bg-gradient-to-b from-[var(--trello-blue)] to-[var(--trello-blue-hover)] items-center justify-center p-12'>
        <div className='max-w-md text-white'>
          <div className='mb-8'>
            <div className='flex items-center gap-3'>
              <div className='h-12 w-12 rounded-full bg-white/30 flex items-center justify-center text-2xl font-bold text-white'>
                E
              </div>
              <div>
                <h1 className='text-3xl font-semibold text-white'>Epitrello</h1>
                <p className='text-sm text-white/90'>
                  Back-office for merchants — log in to access your dashboard
                </p>
              </div>
            </div>
          </div>

          <div className='space-y-4'>
            <h2 className='text-2xl font-semibold text-white'>
              Manage your products and orders
            </h2>
            <p className='text-white/95'>
              View statistics, add products, and configure your store.
            </p>
            <ul className='mt-4 space-y-2 text-sm text-white/95'>
              <li>• Real-time dashboard</li>
              <li>• Product management</li>
              <li>• Order history</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className='flex flex-1 items-center justify-center p-8 bg-white'>
        <div className='max-w-md w-full'>
          <div className='mb-6 md:hidden text-center'>
            <div className='mx-auto h-12 w-12 rounded-full bg-trello-blue flex items-center justify-center text-white font-bold'>
              E
            </div>
            <h1 className='mt-3 text-xl font-semibold text-trello'>Epitrello</h1>
            <p className='text-sm text-trello-secondary'>Sign in to your account</p>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor='email'>Email address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor='password'>Password</Label>
                <div className='relative'>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className={`pr-20 ${errors.password ? "border-red-500" : ""}`}
                    placeholder="••••••••"
                    aria-label="Password"
                  />
                  {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
                  <Button
                    type='button'
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword((s) => !s)}
                    className='absolute right-2 top-1/2 -translate-y-1/2'
                    aria-pressed={showPassword}
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </div>

              <div className='flex items-center justify-between text-sm'>
                <label className='flex items-center gap-2'>
                  <input
                    type="checkbox"
                    {...register("rememberMe")}
                    className="h-4 w-4 text-trello-blue border-gray-300 rounded"
                  />
                  <span className='block text-sm font-medium text-trello-secondary '>
                    Remember me
                  </span>
                </label>
                <a
                  href='/auth/forgot'
                  className='text-trello-blue hover:underline'
                >
                  Forgot password?
                </a>
              </div>

              {error && <div className='text-red-600 text-sm'>{error}</div>}

              <div>
                <Button
                  type='submit'
                  disabled={loading}
                  className='w-full'
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>

              <div className='flex items-center gap-2'>
                <div className='flex-1 h-px bg-trello-border' />
                <div className='text-xs text-trello-secondary uppercase'>or</div>
                <div className='flex-1 h-px bg-trello-border' />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <Button
                  type='button'
                  variant="outline"
                  onClick={() => {
                    console.log('Google OAuth login');
                    // Redirect to backend OAuth start endpoint for Google.
                    // Use NEXT_PUBLIC_API_URL if available (strip /graphql),
                    // otherwise fallback to http://localhost:4000
                    if (typeof window !== 'undefined') {
                      const backend = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql').replace(/\/graphql\/?$/, '');
                      console.log("url backend:", backend);
                      const target = `${backend}/auth/google`;
                      console.log("auth] redirecting to Google OAuth:", target);
                      try {
                        window.location.assign(target);
                      } catch {
                        window.open(target, '_self');
                      }
                    }
                  }}
                >
                  <span className='text-sm'>Google</span>
                </Button>
                <Button
                  type='button'
                  variant="outline"
                  onClick={() => {
                    // Redirect to backend OAuth start endpoint for Microsoft.
                    if (typeof window !== 'undefined') {
                      const backend = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql').replace(/\/graphql\/?$/, '');
                      const target = `${backend}/auth/microsoft`;
                      try {
                        console.log("[auth] redirecting to Microsoft OAuth:", target);
                        window.location.assign(target);
                      } catch {
                        window.open(target, '_self');
                      }
                    }
                  }}
                >
                  <span className='text-sm'>Microsoft</span>
                </Button>
                <Button
                  type='button'
                  variant="outline"
                  onClick={() => {
                    // Redirect to backend OAuth start endpoint for Apple.
                    if (typeof window !== 'undefined') {
                      const backend = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql').replace(/\/graphql\/?$/, '');
                      const target = `${backend}/auth/apple`;
                      try {
                        console.log("[auth] redirecting to Apple OAuth:", target);
                        window.location.assign(target);
                      } catch {
                        window.open(target, '_self');
                      }
                    }
                  }}
                >
                  <span className='text-sm'>Apple</span>
                </Button>
                <Button
                  type='button'
                  variant="outline"
                  onClick={() => {
                    // Redirect to backend OAuth start endpoint for Slack.
                    if (typeof window !== 'undefined') {
                      const backend = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql').replace(/\/graphql\/?$/, '');
                      const target = `${backend}/auth/slack`;
                      try {
                        console.log('[auth] redirecting to Slack OAuth:', target);
                        window.location.assign(target);
                      } catch {
                        window.open(target, '_self');
                      }
                    }
                  }}
                >
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
