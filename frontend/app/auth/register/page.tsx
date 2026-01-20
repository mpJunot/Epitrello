'use client';

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const RegisterSchema = z
  .object({
    name: z.string().min(1, "Nom requis"),
    company: z.string().optional(),
    email: z.string().min(1, "Email requis").email("Email invalide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirm: z.string().min(1, "Veuillez confirmer le mot de passe"),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "Les mots de passe ne correspondent pas",
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
        throw new Error(text || `Erreur serveur: ${res.status}`);
      }

      const json = await res.json();
      if (json.errors && json.errors.length) {
        throw new Error(json.errors[0].message || "Erreur GraphQL");
      }

      const token = json.data?.register?.token;
      if (token && typeof window !== "undefined") {
        try {
          localStorage.setItem("token", token);
        } catch (e) {
          // ignore
        }
      }

      // redirect to success page
      if (typeof window !== "undefined") {
        window.location.href = "/auth/register/success";
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'inscription";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-black text-lg font-semibold mb-4">Create an account</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600">Full name</label>
              <input {...register("name")}
                className={`mt-1 block w-full rounded-md border-2 border-grey-300 text-black p-2 ${errors.name ? "border-red-500" : ""}`}
                placeholder="Jean Dupont" />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-600">Shop name (optional)</label>
              <input {...register("company")} className="mt-1 block w-full rounded-md border-2 border-grey-300 text-black p-2" placeholder="Ma boutique" />
            </div>

            <div>
              <label className="block text-sm text-gray-600">Adresse e-mail</label>
              <input {...register("email")} type="email" className={`mt-1 block w-full rounded-md border-2 border-grey-300 text-black p-2 ${errors.email ? "border-red-500" : ""}`} placeholder="vous@exemple.com" />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-600">Mot de passe</label>
              <input {...register("password")} type="password" className={`mt-1 block w-full rounded-md border-2 border-grey-300 text-black p-2 ${errors.password ? "border-red-500" : ""}`} placeholder="••••••••" />
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-600">Confirmer le mot de passe</label>
              <input {...register("confirm")} type="password" className={`mt-1 block w-full rounded-md border-2 border-grey-300 text-black p-2 ${errors.confirm ? "border-red-500" : ""}`} placeholder="••••••••" />
              {errors.confirm && <p className="text-red-600 text-sm mt-1">{errors.confirm.message}</p>}
            </div>

            <div>
              <button type="submit" disabled={isSubmitting} className="w-full rounded-lg px-4 py-2 bg-indigo-600 text-white">
                {isSubmitting ? "Création..." : "Créer mon compte"}
              </button>
            </div>

            <p className='text-sm text-gray-600 text-center'>
              By creating an account, you accept our terms.
            </p>
          </form>
        </div>

        <p className='text-center text-sm text-gray-600 mt-4'>
          Already have an account?{' '}
          <a href='/auth/login' className='text-indigo-600'>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

// success page moved to /app/register/success/page.tsx
