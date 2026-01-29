'use client';

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RegisterSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name required")
      .refine((s) => s.length === 0 || s.length >= 3, {
        message: "name must be longer than or equal to 3 characters",
      }),
    company: z.string().optional(),
    email: z.string().min(1, "Email required").email("Invalid email"),
    password: z.string().min(8, "Password must contain at least 8 characters"),
    confirm: z.string().min(1, "Please confirm password"),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

type RegisterForm = z.infer<typeof RegisterSchema>;

export default function RegisterPage() {
  const [, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { company: "" },
  });

  const onSubmit = async (data: RegisterForm) => {
    const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql";
    try {
      setError(null);
      console.log("API URL:", url);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation Register($input: RegisterInput!) {\n  register(input: $input) {\n    token\n    user { id email name avatar createdAt updatedAt }\n  }\n}\n`,
          variables: {
            input: {
              email: data.email,
              name: data.name,
              password: data.password,
              companyName: data.company || undefined,
            },
          },
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Server error: ${res.status}`);
      }

      const json = await res.json();
      if (json.errors && json.errors.length) {
        throw new Error(json.errors[0].message || "Erreur GraphQL");
      }

      const token = json.data?.register?.token;
      if (token && typeof window !== "undefined") {
        try {
          localStorage.setItem("token", token);
        } catch {
          // ignore
        }
      }

      if (typeof window !== "undefined") {
        window.location.href = "/auth/register/success";
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration error";
      setError(message);
    }
  };

  return (
    <div className='min-h-screen flex w-full'>
      {/* Left: brand / illustration */}
      <div className='hidden md:flex w-1/2 bg-gradient-to-b from-[var(--trello-blue)] to-[var(--trello-blue-hover)] items-center justify-center p-12'>
        <div className='max-w-lg text-white flex flex-col justify-center h-full'>
          {/* Brand section */}
          <div className='mb-12'>
            <div className='flex items-center gap-4 mb-4'>
              <div className='h-14 w-14 rounded-full bg-white/30 flex items-center justify-center text-3xl font-bold text-white shadow-lg'>
                E
              </div>
              <div>
                <h1 className='text-4xl font-bold text-white mb-2'>Epitrello</h1>
                <p className='text-base text-white/90 leading-relaxed'>
                  Back-office for merchants — create an account to get started
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
                  <span className='text-white text-xl leading-none mt-1'>•</span>
                  <span>Real-time dashboard</span>
                </li>
                <li className='flex items-start gap-3'>
                  <span className='text-white text-xl leading-none mt-1'>•</span>
                  <span>Product management</span>
                </li>
                <li className='flex items-start gap-3'>
                  <span className='text-white text-xl leading-none mt-1'>•</span>
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
          <div className='mb-6'>
            <h1 className='mt-3 text-xl font-semibold text-trello'>Create an account</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">Full name</Label>
              <Input
                id="name"
                {...register("name")}
                className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-destructive text-sm mt-1.5">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium text-foreground">
                Shop name <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="company"
                {...register("company")}
                placeholder="My shop"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email address</Label>
              <Input
                id="email"
                {...register("email")}
                type="email"
                className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-destructive text-sm mt-1.5">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
              <Input
                id="password"
                {...register("password")}
                type="password"
                className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-destructive text-sm mt-1.5">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-sm font-medium text-foreground">Confirm password</Label>
              <Input
                id="confirm"
                {...register("confirm")}
                type="password"
                className={errors.confirm ? "border-destructive focus-visible:ring-destructive" : ""}
                placeholder="••••••••"
              />
              {errors.confirm && <p className="text-destructive text-sm text-red-600 mt-1.5">{errors.confirm.message}</p>}
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-base font-medium">
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </div>

            <p className='text-xs text-muted-foreground text-center leading-relaxed pt-2'>
              By creating an account, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          </form>

          <p className='text-center text-sm text-muted-foreground mt-6'>
            Already have an account?{' '}
            <a href='/auth/login' className='text-primary font-medium hover:underline transition-colors'>
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// success page moved to /app/register/success/page.tsx
