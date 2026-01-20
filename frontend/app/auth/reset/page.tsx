"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ResetSchema = z
  .object({
    password: z.string().min(6, "Password must contain at least 6 characters"),
    confirm: z.string().min(1, "Please confirm password"),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords do not match" });

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
      toast.error("Lien invalide ou expiré (token manquant).");
      return;
    }

    const graphqlEndpoint = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql";
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
      if (json.errors && json.errors.length) throw new Error(json.errors[0].message || "GraphQL error");

      // redirect to success page
      if (typeof window !== "undefined") window.location.href = "/auth/reset/success";
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Reset error";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-trello-hover">
      <div className="max-w-md w-full">
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Reset password</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>New password</Label>
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
                {isSubmitting ? "Resetting..." : "Reset password"}
              </Button>
            </div>

            <p className="text-sm text-trello-secondary text-center">
              Back to{' '}
              <a href="/auth/login" className="text-trello-blue">login</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
