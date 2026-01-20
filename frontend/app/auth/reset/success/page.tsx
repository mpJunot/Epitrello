export default function ResetSuccess() {
return (
<div className="min-h-screen flex items-center justify-center p-6 bg-trello-hover">
<div className="max-w-md w-full text-center">
<div className="bg-white shadow rounded-2xl p-6">
<h2 className="text-xl font-semibold mb-2">Password reset</h2>
<p className="text-sm text-trello-secondary mb-4">Your password has been updated. You can now sign in.</p>
<a href="/auth/login" className="inline-block px-4 py-2 rounded-lg bg-trello-blue text-white">Go to login</a>
</div>
</div>
</div>
);
}
