export function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-600">
        <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
        <span>Chargement du board...</span>
      </div>
    </div>
  );
}
