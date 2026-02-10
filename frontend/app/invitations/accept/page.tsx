'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { acceptInvitation } from '@/lib/actions/workspaces';
import { toast } from '@/lib/toast';
import { getAuthToken } from '@/lib/graphql-client';

export default function AcceptInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>(
    id ? 'idle' : 'error',
  );
  const [message, setMessage] = useState<string>(
    id ? 'Processing invitation...' : 'Missing invitation id in URL.',
  );

  useEffect(() => {
    if (!id) return;

    const token = getAuthToken();
    if (!token) {
      const nextUrl = `/invitations/accept?id=${encodeURIComponent(id)}`;
      router.push(`/auth/login?next=${encodeURIComponent(nextUrl)}`);
      return;
    }

    const run = async () => {
      setStatus('processing');
      try {
        await acceptInvitation(id);
        toast.success('Invitation accepted');
        setStatus('done');
        setMessage('Invitation accepted. Redirecting to your invitations...');
        setTimeout(() => {
          router.push('/invitations');
        }, 1200);
      } catch (err) {
        const text =
          err instanceof Error ? err.message : 'Failed to accept invitation';
        toast.error(text);
        setStatus('error');
        setMessage(text);
      }
    };

    void run();
  }, [router, id]);

  return (
    <div className='h-full min-h-screen flex flex-col p-8 md:p-12 bg-background'>
      <div className='flex-1 flex items-center justify-center'>
        <div className='max-w-md w-full p-6 rounded-lg border border-accent bg-card shadow-sm text-center space-y-3'>
        <h1 className='text-xl font-semibold text-foreground'>
          Accepting invitation
        </h1>
        <p className='text-sm text-muted-foreground'>{message}</p>
        {status === 'processing' && (
          <div className='flex items-center justify-center pt-2'>
            <div className='animate-spin h-6 w-6 border-2 border-trello-blue border-t-transparent rounded-full' />
          </div>
        )}
        {status === 'error' && (
          <button
            type='button'
            onClick={() => router.push('/invitations')}
            className='mt-2 inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90'
          >
            Go to my invitations
          </button>
        )}
        </div>
      </div>
    </div>
  );
}

