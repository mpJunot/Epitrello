export const metadata = {
  title: "Activity",
};

export default async function ActivityPage() {
  // Note: Activity tracking is not yet implemented in the backend
  // This page will be enabled once the backend supports activity queries

  return (
    <main className="p-6 w-full h-full overflow-auto">
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-semibold">Activity</h1>
        <p className="text-sm text-muted-foreground">Track your recent activity and changes.</p>
      </div>

      <div className="rounded-lg border border-dashed border-muted p-8 text-center bg-muted/30">
        <div className="text-sm font-medium text-muted-foreground mb-2">
          Activity tracking coming soon
        </div>
        <div className="text-xs text-muted-foreground">
          This feature is currently being developed and will be available in a future update.
        </div>
      </div>
    </main>
  );
}
