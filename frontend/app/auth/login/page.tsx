'use client';

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { setAuthToken } from "@/lib/graphql-client";

const LoginSchema = z.object({
  email: z.string().min(1, "Email requis").email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
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
    const url = "http://localhost:4000/graphql";
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `mutation Login($input: LoginInput!) {\n  login(input: $input) {\n    token\n    user { id email name avatar createdAt updatedAt }\n  }\n}\n`,
          variables: {
            input: {
              email: data.email,
              password: data.password,
              rememberMe: data.rememberMe || false,
            },
          },
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erreur réseau");
      }

      const json = await res.json();
      if (json.errors && json.errors.length) {
        throw new Error(json.errors[0].message || "Erreur GraphQL");
      }

      // Store the token
      if (json.data?.login?.token) {
        setAuthToken(json.data.login.token);
      }

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex'>
      {/* Left: brand / illustration */}
      <div className='hidden md:flex w-1/2 bg-linear-to-b from-sky-600 to-indigo-700 items-center justify-center p-12'>
        <div className='max-w-md text-white'>
          <div className='mb-8'>
            <div className='flex items-center gap-3'>
              <div className='h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold'>
                E
              </div>
              <div>
                <h1 className='text-3xl font-semibold'>Epitrello</h1>
                <p className='text-sm opacity-90'>
                  Back-office for merchants — log in to access your dashboard
                </p>
              </div>
            </div>
          </div>

          <div className='space-y-4'>
            <h2 className='text-2xl font-semibold'>
              Manage your products and orders
            </h2>
            <p className='opacity-95'>
              View statistics, add products, and configure your store.
            </p>
            <ul className='mt-4 space-y-2 text-sm opacity-95'>
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
            <div className='mx-auto h-12 w-12 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold'>
              E
            </div>
            <h1 className='mt-3 text-xl font-semibold text-gray-900'>Epitrello</h1>
            <p className='text-sm text-gray-600'>Sign in to your account</p>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-gray-700'
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={`text-black mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 ${errors.email ? "border-red-500" : ""}`}
                  placeholder="vous@exemple.com"
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-gray-700'
                >
                  Password
                </label>
                <div className='relative'>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className={`text-black mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 pr-20 ${errors.password ? "border-red-500" : ""}`}
                    placeholder="••••••••"
                    aria-label="Mot de passe"
                  />
                  {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
                  <button
                    type='button'
                    onClick={() => setShowPassword((s) => !s)}
                    className='absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 px-2 py-1 rounded'
                    aria-pressed={showPassword}
                    aria-label={
                      showPassword
                        ? 'Cacher le mot de passe'
                        : 'Voir le mot de passe'
                    }
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className='flex items-center justify-between text-sm'>
                <label className='flex items-center gap-2'>
                  <input
                    type="checkbox"
                    {...register("rememberMe")}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <span className='block text-sm font-medium text-gray-700 '>
                    Remember me
                  </span>
                </label>
                <a
                  href='/auth/forgot'
                  className='text-indigo-600 hover:underline'
                >
                  Forgot password?
                </a>
              </div>

              {error && <div className='text-red-600 text-sm'>{error}</div>}

              <div>
                <button
                  type='submit'
                  disabled={loading}
                  className='w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 disabled:opacity-60'
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>

              <div className='flex items-center gap-2'>
                <div className='flex-1 h-px bg-gray-200' />
                <div className='text-xs text-gray-400 uppercase'>or</div>
                <div className='flex-1 h-px bg-gray-200' />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <button
                  type='button'
                  onClick={() => {
                    console.log('Google OAuth login');
                    // Redirect to backend OAuth start endpoint for Google.
                    // Use NEXT_PUBLIC_BACKEND_URL if available (strip /graphql),
                    // otherwise fallback to http://localhost:4000
                    if (typeof window !== 'undefined') {
                      const backend = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/graphql').replace(/\/graphql\/?$/, '');
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
                  className='inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm'
                >
                  <span className='text-sm text-gray-700'>Google</span>
                </button>
                <button
                  type='button'
                  onClick={() => {
                    // Redirect to backend OAuth start endpoint for Microsoft.
                    if (typeof window !== 'undefined') {
                      const backend = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/graphql').replace(/\/graphql\/?$/, '');
                      const target = `${backend}/auth/microsoft`;
                      try {
                        console.log("[auth] redirecting to Microsoft OAuth:", target);
                        window.location.assign(target);
                      } catch {
                        window.open(target, '_self');
                      }
                    }
                  }}
                  className='inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm'
                >
                  <span className='text-sm text-gray-700'>Microsoft</span>
                </button>
                <button
                  type='button'
                  onClick={() => {
                    // Redirect to backend OAuth start endpoint for Apple.
                    if (typeof window !== 'undefined') {
                      const backend = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/graphql').replace(/\/graphql\/?$/, '');
                      const target = `${backend}/auth/apple`;
                      try {
                        console.log("[auth] redirecting to Apple OAuth:", target);
                        window.location.assign(target);
                      } catch {
                        window.open(target, '_self');
                      }
                    }
                  }}
                  className='inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm'
                >
                  {/* Placeholder icons using text */}
                  <span className='text-sm text-gray-700'>Apple</span>
                </button>
                <button
                  type='button'
                  onClick={() => {
                    // Redirect to backend OAuth start endpoint for Slack.
                    if (typeof window !== 'undefined') {
                      const backend = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/graphql').replace(/\/graphql\/?$/, '');
                      const target = `${backend}/auth/slack`;
                      try {
                        console.log('[auth] redirecting to Slack OAuth:', target);
                        window.location.assign(target);
                      } catch {
                        window.open(target, '_self');
                      }
                    }
                  }}
                  className='inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm'
                >
                  <span className='text-sm text-gray-700'>Slack</span>
                </button>
              </div>

              <p className='text-center text-sm text-gray-500 mt-2'>
                Don&apos;t have an account?{' '}
                <a
                  href='/auth/register/'
                  className='text-indigo-600 hover:underline'
                >
                  Create an account
                </a>
              </p>
            </form>
          </div>

          <p className='text-xs text-gray-400 text-center mt-4'>
            By signing in, you agree to the terms of use and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
