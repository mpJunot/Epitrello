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
    if (v) return setError("error");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, name, email, password }),
      });
      if (!res.ok) throw new Error("Impossible de créer le compte.");
      // redirection vers page de succès ou connexion
      window.location.href = "/register/success";
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

export function RegisterSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-2">Compte créé !</h2>
          <p className="text-sm text-gray-600 mb-4">Un e-mail de confirmation a été envoyé. Vérifiez votre boîte de réception pour activer votre compte.</p>
          <a href="/login" className="inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white">Aller à la connexion</a>
        </div>
      </div>
    </div>
  );
}
