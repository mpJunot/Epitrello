"use client";

import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const url = "http://localhost:4000/graphql";
    console.log("Posting to", url);
    try {
      const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: `
          mutation Register($input: RegisterInput!) {
          register(input: $input) {
            token
            user {
              id
              email
              name
              avatar
              createdAt
              updatedAt
            }
          }
        }
        `,
        variables: {
          "input": {
            "email": email,
            "name": name,
            "password": password,
          }
        }
      }),
    });

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: brand / illustration */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-b from-sky-600 to-indigo-700 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">E</div>
              <div>
                <h1 className="text-3xl font-semibold">Epitrello</h1>
                <p className="text-sm opacity-90">Back-office pour commerçants — connectez-vous pour accéder à votre tableau de bord</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Gérez vos produits et commandes</h2>
            <p className="opacity-95">Voir statistiques, ajouter des produits, et configurer votre boutique.</p>
            <ul className="mt-4 space-y-2 text-sm opacity-95">
              <li>• Tableau de bord en temps réel</li>
              <li>• Gestion des produits</li>
              <li>• Historique des commandes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex flex-1 items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full">
          <div className="mb-6 md:hidden text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold">E</div>
            <h1 className="mt-3 text-xl font-semibold">Epitrello</h1>
            <p className="text-sm text-gray-600">Connectez-vous à votre compte</p>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse e-mail</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-black mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
                  placeholder="vous@exemple.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="text-black mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 pr-20"
                    placeholder="••••••••"
                    aria-label="Mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 px-2 py-1 rounded"
                    aria-pressed={showPassword}
                    aria-label={showPassword ? "Cacher le mot de passe" : "Voir le mot de passe"}
                  >
                    {showPassword ? "Cacher" : "Voir"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <span className="block text-sm font-medium text-gray-700 ">Se souvenir de moi</span>
                </label>
                <a href="/auth/forgot" className="text-indigo-600 hover:underline">Mot de passe oublié ?</a>
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 disabled:opacity-60"
                >
                  {loading ? "Connexion..." : "Se connecter"}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-200" />
                <div className="text-xs text-gray-400 uppercase">ou</div>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    // Redirect to backend OAuth start endpoint. Backend is expected to
                    // handle the Google OAuth handshake and callback.
                    if (typeof window !== "undefined") {
                      window.location.href = "/api/auth/google";
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm"
                >
                  <span className="text-sm text-gray-700">Google</span>
                </button>
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm">
                  <span className="text-sm text-gray-700">Microsoft</span>
                </button>
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm">
                  {/* Placeholder icons using text */}
                  <span className="text-sm text-gray-700">Apple</span>
                </button>
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm">
                  <span className="text-sm text-gray-700">Slack</span>
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-2">
                Vous n'avez pas de compte ? <a href="/auth/register/" className="text-indigo-600 hover:underline">Créer un compte</a>
              </p>
            </form>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">En vous connectant, vous acceptez les conditions d'utilisation et la politique de confidentialité.</p>
        </div>
      </div>
    </div>
  );
}
