export function LoadingState() {
  return (
    <div className="min-h-screen bg-trello-hover flex items-center justify-center">
      <div className="flex items-center gap-3 text-trello-text-secondary">
        <div className="animate-spin h-5 w-5 border-2 border-trello-blue border-t-transparent rounded-full" />
        <span>Loading board...</span>
      </div>
    </div>
  );
}
