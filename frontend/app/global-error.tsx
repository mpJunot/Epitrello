'use client';

/** Skip static prerender to avoid "useContext" null when shared chunks load theme code. */
export const dynamic = 'force-dynamic';

/**
 * Global error boundary. Must not use any React context (ThemeProvider, etc.)
 * so that Next.js can prerender it at build time without "useContext" null errors.
 * Replaces the root layout when triggered, so <html> and <body> are required.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang='en'>
      <body>
        <div
          style={{
            padding: '2rem',
            fontFamily: 'system-ui, sans-serif',
            maxWidth: '480px',
            margin: '0 auto',
          }}
        >
          <h2>Something went wrong</h2>
          <p>{error.message || 'An unexpected error occurred.'}</p>
          <button
            type='button'
            onClick={() => reset()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
