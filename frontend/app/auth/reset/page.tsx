"use client";
import { useState } from "react";

export default function ResetPasswordPage(props: any) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('token')
    : (props && props.searchParams && (props.searchParams.token)) || null;

  const validate = () => {
    if (!password || !confirm) return "Veuillez remplir tous les champs.";
    if (password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
    if (password !== confirm) return "Les mots de passe ne correspondent pas.";
    if (!token) return "Token manquant — le lien est invalide ou expiré.";
    return null;
  };

  const handleReset = async (e : any) => {
    e.preventDefault();
    setError(null);
    const v = validate();
    // if (v) return setError(v);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) throw new Error("Impossible de réinitialiser le mot de passe. Le lien est peut-être expiré.");
      // rediriger vers page de succès
      window.location.href = "/auth/reset/success";
    } catch (err : any) {
      setError(err.message || "Erreur lors de la réinitialisation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Réinitialiser le mot de passe</h2>

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm">Nouveau mot de passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full rounded-md border border-black p-2 focus:border-black focus:ring-black" placeholder="••••••••" />
            </div>

            <div>
              <label className="block text-sm">Confirmer le mot de passe</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="mt-1 block w-full rounded-md border border-black p-2 focus:border-black focus:ring-black" placeholder="••••••••" />
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div>
              <button type="submit" disabled={loading} className="w-full rounded-lg px-4 py-2 bg-indigo-600 text-white">
                {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
              </button>
            </div>

            <p className="text-sm text-gray-500 text-center">Retour à la <a href="/login" className="text-indigo-600">connexion</a></p>
          </form>
        </div>
      </div>
    </div>
  );
}
