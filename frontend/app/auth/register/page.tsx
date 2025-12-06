"use client";

import React, { useState } from "react";

// ---- Registration components (à placer si besoin dans /app/register/page.jsx) ----

export default function RegisterPage() {    
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as string | null);

  const validate = () => {
    if (!email || !password || !name) return "Veuillez remplir tous les champs requis.";
    if (password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
    if (password !== confirm) return "Les mots de passe ne correspondent pas.";
    return null;
  };

  const handleRegister = async (e : any) => {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) return setError(v);
    setLoading(true);
    try {
      console.log("Registering", { company, name, email, password });
      const url = "http://localhost:4000/graphql";
      console.log("Posting to", url);
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
            "email": "maillotbenjamin1@gmail.com",
            "name": "bob",
            "password": "Test974!",
            "companyName": "My Company" // Optional - creates a workspace
          }
        }
      })
    });

      // parse body to show server error message when present
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        const msg = data?.error || "Impossible de créer le compte.";
        throw new Error(msg);
      }

      // Save token locally (optional) so client can call backend directly using Authorization header
      try {
        if (data.token && typeof window !== "undefined") {
          localStorage.setItem("token", data.token);
        }
      } catch (e) {
        // ignore storage errors
      }

      // redirection vers page de succès ou connexion (chemin dans l'app)
      window.location.href = "/auth/register/success";
    } catch (err : any) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full"> 
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-black text-lg font-semibold mb-4">Créer un compte</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600">Nom complet</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-2 border-grey-300 text-black p-2" placeholder="Jean Dupont" />
            </div>

            <div>
              <label className="block text-sm text-gray-600">Nom de la boutique (optionnel)</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} className="mt-1 block w-full rounded-md border-2 border-grey-300 text-black p-2" placeholder="Ma boutique" />
            </div>

            <div>
              <label className="block text-sm text-gray-600">Adresse e-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full rounded-md border-2 border-grey-300 text-black p-2" placeholder="vous@exemple.com" />
            </div>

            <div>
              <label className="block text-sm text-gray-600">Mot de passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full rounded-md border-2 border-grey-300 text-black p-2" placeholder="••••••••" />
            </div>

            <div>
              <label className="block text-sm text-gray-600">Confirmer le mot de passe</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="mt-1 block w-full rounded-md border-2 border-grey-300 text-black p-2" placeholder="••••••••" />
            </div>

            {error && <div className="text-red-600 text-sm text-gray-600">{error}</div>}

            <div>
              <button type="submit" disabled={loading} className="w-full rounded-lg px-4 py-2 bg-indigo-600 text-white">
                {loading ? "Création..." : "Créer mon compte"}
              </button>
            </div>

            <p className="text-sm text-gray-600 text-gray-500 text-center">En créant un compte, vous acceptez nos conditions.</p>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">Déjà un compte ? <a href="/login" className="text-indigo-600">Se connecter</a></p>
      </div>
    </div>
  );
}

// success page moved to /app/register/success/page.tsx
