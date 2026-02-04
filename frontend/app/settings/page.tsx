'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChevronDown,
  Bell,
  User,
  Globe,
  Palette,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { updateUser } from '@/lib/actions/users';
import { useCurrentUserQuery, currentUserQueryKey } from '@/lib/queries/users';
import { AccountSettingsSchema, type AccountSettingsForm } from './schema';
import { ThemeSelector } from './components/ThemeSelector';
import { SettingsSkeleton } from './components/SettingsSkeleton';
import { SettingsSection } from './components/SettingsSection';
import { DangerZone } from './components/DangerZone';
import { AvatarPicker } from './components/AvatarPicker';

export default function AccountSettingsPage() {
  const queryClient = useQueryClient();
  const [passwordResetSending, setPasswordResetSending] = useState(false);

  const { data: user, isLoading: loading } = useCurrentUserQuery();

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<AccountSettingsForm>({
    resolver: zodResolver(AccountSettingsSchema),
    defaultValues: { name: '', email: '', avatar: '', description: '' },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || '',
        description: user.description || '',
      });
    } else if (user === null && !loading) {
      toast.error('Failed to load user information');
    }
  }, [user, loading, reset]);

  const onSave = async (data: AccountSettingsForm) => {
    if (!user?.id) {
      toast.error('User ID not found');
      return;
    }

    try {
      await updateUser(user.id, {
        name: data.name,
        email: data.email,
        avatar: data.avatar?.trim() || undefined,
        description: data.description?.trim() || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
      reset(data);
      toast.success('Account updated');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save';
      toast.error(message);
      console.error('Failed to update user', error);
    }
  };

  const sendPasswordResetLink = async () => {
    if (!user?.email) {
      toast.error('Email not found');
      return;
    }
    setPasswordResetSending(true);
    try {
      const graphqlEndpoint =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';
      const query = `mutation ForgotPassword($input: ForgotPasswordInput!) { forgotPassword(input: $input) { message } }`;
      const res = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          variables: { input: { email: user.email } },
        }),
      });
      if (!res.ok) throw new Error('Server error');
      const json = await res.json();
      if (json.errors?.length) throw new Error(json.errors[0].message);
      const msg =
        json.data?.forgotPassword?.message ||
        'If an account exists for this email, you will receive a reset link.';
      toast.success(msg, 'Email sent');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to send reset link',
      );
    } finally {
      setPasswordResetSending(false);
    }
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className='flex h-full w-full flex-col p-8 md:p-12'>
      <div className='flex min-h-0 flex-1 flex-col gap-6 w-full max-w-5xl'>
        <div className='shrink-0 space-y-1'>
          <h1 className='text-2xl font-semibold'>Account settings</h1>
          <p className='text-sm text-muted-foreground'>
            Manage your profile and preferences.
          </p>
        </div>

        <Tabs
          defaultValue='profile'
          orientation='vertical'
          className='flex min-h-0 flex-1 flex-row gap-8 w-full'
        >
          <TabsList className='flex h-full flex-col w-52 shrink-0 bg-muted/50 p-1.5'>
            <TabsTrigger
              value='profile'
              className='w-full justify-start gap-2 rounded-md border-l-2 border-transparent py-2.5 pl-3 data-[state=active]:border-primary data-[state=active]:bg-background'
            >
              <User className='h-4 w-4' />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value='language'
              className='w-full justify-start gap-2 rounded-md border-l-2 border-transparent py-2.5 pl-3 data-[state=active]:border-primary data-[state=active]:bg-background'
            >
              <Globe className='h-4 w-4' />
              Language
            </TabsTrigger>
            <TabsTrigger
              value='appearance'
              className='w-full justify-start gap-2 rounded-md border-l-2 border-transparent py-2.5 pl-3 data-[state=active]:border-primary data-[state=active]:bg-background'
            >
              <Palette className='h-4 w-4' />
              Appearance
            </TabsTrigger>
            <TabsTrigger
              value='security'
              className='w-full justify-start gap-2 rounded-md border-l-2 border-transparent py-2.5 pl-3 data-[state=active]:border-primary data-[state=active]:bg-background'
            >
              <Lock className='h-4 w-4' />
              Security
            </TabsTrigger>
            <TabsTrigger
              value='notifications'
              className='w-full justify-start gap-2 rounded-md border-l-2 border-transparent py-2.5 pl-3 data-[state=active]:border-primary data-[state=active]:bg-background'
            >
              <Bell className='h-4 w-4' />
              Notifications
            </TabsTrigger>
            {user?.id && (
              <TabsTrigger
                value='danger'
                className='w-full justify-start gap-2 rounded-md border-l-2 border-transparent py-2.5 pl-3 text-muted-foreground data-[state=active]:border-destructive data-[state=active]:bg-background data-[state=active]:text-destructive'
              >
                <AlertTriangle className='h-4 w-4' />
                Danger zone
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent
            value='profile'
            className='mt-0 flex-1 focus-visible:outline-none'
          >
            <form onSubmit={handleSubmit(onSave)}>
              <SettingsSection
                title='Profile'
                description='Your public profile information.'
                className='space-y-6'
              >
                <AvatarPicker
                  value={watch('avatar') ?? ''}
                  disabled={isSubmitting}
                  onUploaded={(url) => {
                    setValue('avatar', url, { shouldDirty: true });
                  }}
                  size='large'
                />
                <div className='space-y-2'>
                  <Label htmlFor='name'>Full name</Label>
                  <Input
                    id='name'
                    {...register('name')}
                    disabled={isSubmitting}
                    placeholder='Enter your full name'
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p className='text-sm text-destructive'>
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    {...register('email')}
                    disabled={isSubmitting}
                    placeholder='Enter your email address'
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className='text-sm text-destructive'>
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='description'>Bio</Label>
                  <Textarea
                    id='description'
                    {...register('description')}
                    disabled={isSubmitting}
                    placeholder='A short bio about you (optional)'
                    rows={3}
                    className={errors.description ? 'border-destructive' : ''}
                  />
                  {errors.description && (
                    <p className='text-sm text-destructive'>
                      {errors.description.message}
                    </p>
                  )}
                </div>
                <Button type='submit' disabled={isSubmitting || !isDirty}>
                  {isSubmitting ? 'Saving...' : 'Save changes'}
                </Button>
              </SettingsSection>
            </form>
          </TabsContent>

          <TabsContent
            value='language'
            className='mt-0 flex-1 focus-visible:outline-none'
          >
            <SettingsSection
              title='Language'
              description='Display language (coming soon).'
            >
              <Button
                id='language'
                type='button'
                variant='outline'
                disabled
                className='w-full max-w-xs justify-between font-normal text-muted-foreground'
              >
                <span>English</span>
                <ChevronDown className='h-4 w-4 opacity-50' />
              </Button>
            </SettingsSection>
          </TabsContent>

          <TabsContent
            value='appearance'
            className='mt-0 flex-1 focus-visible:outline-none'
          >
            <SettingsSection
              title='Appearance'
              description='Theme and display preferences.'
            >
              <ThemeSelector />
            </SettingsSection>
          </TabsContent>

          <TabsContent
            value='security'
            className='mt-0 flex-1 focus-visible:outline-none'
          >
            <SettingsSection
              title='Security'
              description='Password and account security.'
            >
              <div className='space-y-2'>
                <p className='text-sm text-muted-foreground'>
                  To change your password, we&apos;ll send you a secure link by
                  email.
                </p>
                <Button
                  type='button'
                  variant='outline'
                  onClick={sendPasswordResetLink}
                  disabled={passwordResetSending}
                >
                  {passwordResetSending
                    ? 'Sending...'
                    : 'Send password reset link'}
                </Button>
              </div>
            </SettingsSection>
          </TabsContent>

          <TabsContent
            value='notifications'
            className='mt-0 flex-1 focus-visible:outline-none'
          >
            <SettingsSection
              title='Notifications'
              description='How and when you receive notifications.'
            >
              <p className='text-sm text-muted-foreground mb-2'>
                Manage email frequency and notification preferences from your
                profile or when viewing activity.
              </p>
              <Button variant='outline' asChild>
                <Link
                  href='/profile'
                  className='inline-flex items-center gap-2'
                >
                  <Bell className='h-4 w-4' />
                  View profile
                </Link>
              </Button>
            </SettingsSection>
          </TabsContent>

          {user?.id && (
            <TabsContent
              value='danger'
              className='mt-0 flex-1 focus-visible:outline-none'
            >
              <SettingsSection
                title='Danger zone'
                description='Irreversible actions. Delete your account and all associated data.'
                variant='danger'
              >
                <DangerZone userId={user.id} />
              </SettingsSection>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
