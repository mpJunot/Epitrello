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
    name: z.string().min(1, "Name required"),
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

      // redirect to success page
      if (typeof window !== "undefined") {
        window.location.href = "/auth/register/success";
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration error";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-trello-hover">
      <div className="max-w-md w-full">
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-black text-lg font-semibold mb-4">Create an account</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input {...register("name")}
                className={errors.name ? "border-red-500" : ""}
                placeholder="John Doe" />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Shop name (optional)</Label>
              <Input {...register("company")} placeholder="My shop" />
            </div>

            <div className="space-y-2">
              <Label>Email address</Label>
              <Input {...register("email")} type="email" className={errors.email ? "border-red-500" : ""} placeholder="you@example.com" />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input {...register("password")} type="password" className={errors.password ? "border-red-500" : ""} placeholder="••••••••" />
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Confirm password</Label>
              <Input {...register("confirm")} type="password" className={errors.confirm ? "border-red-500" : ""} placeholder="••••••••" />
              {errors.confirm && <p className="text-red-600 text-sm mt-1">{errors.confirm.message}</p>}
            </div>

            <div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Creating..." : "Create account"}
              </Button>
            </div>

            <p className='text-sm text-trello-secondary text-center'>
              By creating an account, you accept our terms.
            </p>
          </form>
        </div>

        <p className='text-center text-sm text-trello-secondary mt-4'>
          Already have an account?{' '}
          <a href='/auth/login' className='text-trello-blue'>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

// success page moved to /app/register/success/page.tsx
