"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const ResetSchema = z
  .object({
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirm: z.string().min(1, "Veuillez confirmer le mot de passe"),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Les mots de passe ne correspondent pas" });

type Form = z.infer<typeof ResetSchema>;

export default function ResetPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(ResetSchema) });

  const onSubmit = async (data: Form) => {
    const token = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("token") : null;
    if (!token) {
      alert("Lien invalide ou expiré (token manquant).");
      return;
    }

    const graphqlEndpoint = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/graphql";
    const query = `mutation ResetPassword($input: ResetPasswordInput!) { resetPassword(input: $input) { message } }`;

    try {
      console.log("GraphQL Endpoint:", graphqlEndpoint);
      const res = await fetch(graphqlEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: { input: { newPassword: data.password, token } } }),
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Erreur serveur: ${res.status}`);
      }

      const json = await res.json();
      if (json.errors && json.errors.length) throw new Error(json.errors[0].message || "Erreur GraphQL");

      // redirect to success page
      if (typeof window !== "undefined") window.location.href = "/auth/reset/success";
    } catch (err: any) {
      alert(err?.message || "Erreur lors de la réinitialisation");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Réinitialiser le mot de passe</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm">Nouveau mot de passe</label>
              <input {...register("password")} type="password" className={`mt-1 block w-full rounded-md border border-black p-2 focus:border-black focus:ring-black ${errors.password ? "border-red-500" : ""}`} placeholder="••••••••" />
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm">Confirmer le mot de passe</label>
              <input {...register("confirm")} type="password" className={`mt-1 block w-full rounded-md border border-black p-2 focus:border-black focus:ring-black ${errors.confirm ? "border-red-500" : ""}`} placeholder="••••••••" />
              {errors.confirm && <p className="text-red-600 text-sm mt-1">{errors.confirm.message}</p>}
            </div>

            <div>
              <button type="submit" disabled={isSubmitting} className="w-full rounded-lg px-4 py-2 bg-indigo-600 text-white">
                {isSubmitting ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
              </button>
            </div>

            <p className="text-sm text-gray-500 text-center">
              Retour à{' '}
              <a href="/auth/login" className="text-indigo-600">connexion</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
