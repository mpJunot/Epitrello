export default function ResetSuccess() {
return (
<div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
<div className="max-w-md w-full text-center">
<div className="bg-white shadow rounded-2xl p-6">
<h2 className="text-xl font-semibold mb-2">Mot de passe réinitialisé</h2>
<p className="text-sm text-gray-600 mb-4">Votre mot de passe a bien été mis à jour. Vous pouvez maintenant vous connecter.</p>
<a href="/login" className="inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white">Aller à la connexion</a>
</div>
</div>
</div>
);
}