"use client";

import React, { useState } from "react";
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Impossible d'envoyer l'email de réinitialisation.");
    } catch (err) {
      setError(err.message || "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-lg text-black font-semibold mb-4">Mot de passe oublié</h2>
          <p className="text-sm text-gray-600 mb-4">Entrez l'adresse e-mail associée à votre compte. Nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-black ">Adresse e-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className=" text-black mt-1 block w-full rounded-md border border-black p-2 focus:border-black focus:ring-black" placeholder="vous@exemple.com" />
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}
            {message && <div className="text-green-600 text-sm">{message}</div>}

            <div>
              <button type="submit" disabled={loading} className="w-full rounded-lg px-4 py-2 bg-indigo-600 text-white">
                {loading ? "Envoi..." : "Envoyer le lien"}
              </button>
            </div>

            <p className="text-sm text-gray-500 text-center">Retour à la <a href="/login" className="text-indigo-600">connexion</a></p>
          </form>
        </div>
      </div>
    </div>
  );
}