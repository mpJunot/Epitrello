import Link from 'next/link';

interface ErrorStateProps {
  error?: string | null;
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-trello-hover flex items-center justify-center">
      <div className="text-center">
        <div className="text-trello-text-secondary mb-4">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-trello mb-2">
          Board not found
        </h2>
        <p className="text-trello-text-secondary mb-4">
          {error ?? "The board you're looking for doesn't exist or has been deleted."}
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-md bg-trello-blue text-white px-4 py-2 text-sm hover:bg-trello-blue-hover"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
