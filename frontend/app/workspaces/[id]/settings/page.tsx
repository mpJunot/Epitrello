'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useParams, useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import { getWorkspace, updateWorkspace, Workspace } from '@/lib/actions/workspaces';
import { Lock, Pencil } from 'lucide-react';

const workspaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  shortName: z.string().min(1, 'Short name is required'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  description: z.string().optional(),
  visibility: z.enum(['PRIVATE', 'PUBLIC', 'WORKSPACE']),
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [showVisibilityDialog, setShowVisibilityDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: '',
      shortName: '',
      website: '',
      description: '',
      visibility: 'PRIVATE',
    },
  });

  const description = watch('description');

  useEffect(() => {
    const loadWorkspace = async () => {
      setLoading(true);
      try {
        const ws = await getWorkspace(workspaceId);
        setWorkspace(ws);
        reset({
          name: ws.name || '',
          shortName: ws.name?.toLowerCase().replace(/\s+/g, '') || '',
          website: '',
          description: ws.description || '',
          visibility: ws.visibility || 'PRIVATE',
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load workspace';
        toast.error(message);
        console.error('Failed to load workspace', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkspace();
  }, [workspaceId, reset]);

  const onSubmit = async (data: WorkspaceFormData) => {
    if (!workspace) return;

    try {
      const updated = await updateWorkspace(workspaceId, {
        name: data.name,
        description: data.description || undefined,
      });
      setWorkspace(updated);
      setIsEditing(false);
      toast.success('Workspace settings saved');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save';
      toast.error(message);
      console.error('Failed to update workspace', error);
    }
  };

  const handleCancel = () => {
    if (!workspace) return;
    reset({
      name: workspace.name || '',
      shortName: workspace.name?.toLowerCase().replace(/\s+/g, '') || '',
      website: '',
      description: workspace.description || '',
      visibility: workspace.visibility || 'PRIVATE',
    });
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const saveVisibility = async (visibility: 'PRIVATE' | 'PUBLIC' | 'WORKSPACE') => {
    if (!workspace) return;

    try {
      const updated = await updateWorkspace(workspaceId, { visibility });
      setWorkspace(updated);
      const currentValues = getValues();
      reset({ ...currentValues, visibility });
      setShowVisibilityDialog(false);
      toast.success('Workspace visibility updated');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save';
      toast.error(message);
      console.error('Failed to update workspace', error);
    }
  };

  const getVisibilityText = (vis: string) => {
    switch (vis) {
      case 'PRIVATE':
        return 'Private';
      case 'PUBLIC':
        return 'Public';
      case 'WORKSPACE':
        return 'Workspace';
      default:
        return vis;
    }
  };

  const getVisibilityDescription = (vis: string) => {
    switch (vis) {
      case 'PRIVATE':
        return "This Workspace is private. It's not indexed or visible to those outside the Workspace.";
      case 'PUBLIC':
        return "This Workspace is public. It's visible to everyone.";
      case 'WORKSPACE':
        return "This Workspace is visible to all workspace members.";
      default:
        return '';
    }
  };

  const getWorkspaceInitials = (name: string) => {
    return name
      .split(' ')
      .map((s) => s[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="h-full w-full">
        <div className="px-6 py-4 w-full max-w-4xl space-y-6">
          <div className="space-y-1">
            <Skeleton className="h-8 w-48" />
          </div>
          <Separator />
          <div className="flex items-start gap-4">
            <Skeleton className="h-24 w-24 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="h-full p-4 flex items-center justify-center">
        <div className="text-muted-foreground">Workspace not found</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <div className="px-6 py-4 w-full max-w-4xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Workspace settings</h1>
        </div>

        <Separator />

        {/* Workspace General Information */}
        <div className="flex items-start gap-4">
          <Avatar className="h-24 w-24 rounded-lg">
            <AvatarImage src={workspace.logoUrl ?? undefined} alt={workspace.name} />
            <AvatarFallback className="rounded-lg text-2xl font-semibold bg-primary text-primary-foreground">
              {getWorkspaceInitials(workspace.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{workspace.name}</h2>
              {!isEditing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleEdit}
                  className="h-6 w-6"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>{getVisibilityText(workspace.visibility)}</span>
            </div>
            {!isEditing && description && (
              <p className="text-sm text-foreground">{description}</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Workspace Form Fields - Only visible when editing */}
        {isEditing && (
          <form id="workspace-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                disabled={isSubmitting}
                placeholder="Enter workspace name"
                className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.name && (
                <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortName" className="font-semibold">
                Short name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="shortName"
                {...register('shortName')}
                disabled={isSubmitting}
                placeholder="Enter short name"
                className={errors.shortName ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.shortName && (
                <p className="text-destructive text-sm mt-1">{errors.shortName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-muted-foreground">
                Website (optional)
              </Label>
              <Input
                id="website"
                type="url"
                {...register('website')}
                disabled={isSubmitting}
                placeholder="https://example.com"
                className={errors.website ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.website && (
                <p className="text-destructive text-sm mt-1">{errors.website.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-muted-foreground">
                Description (optional)
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                disabled={isSubmitting}
                placeholder="Enter workspace description"
                className="min-h-[100px] resize-y"
              />
            </div>
          </form>
        )}

        {isEditing && <Separator />}

        {/* Workspace Visibility */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Workspace visibility</h3>
          <Controller
            name="visibility"
            control={control}
            render={({ field }) => (
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-2 flex-1">
                  <Lock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {getVisibilityText(field.value)} - {getVisibilityDescription(field.value)}
                    </p>
                  </div>
                </div>
                {!showVisibilityDialog ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowVisibilityDialog(true)}
                    disabled={isSubmitting}
                  >
                    Change
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value as 'PRIVATE' | 'PUBLIC' | 'WORKSPACE')}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRIVATE">Private</SelectItem>
                        <SelectItem value="WORKSPACE">Workspace</SelectItem>
                        <SelectItem value="PUBLIC">Public</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => saveVisibility(field.value)}
                      disabled={isSubmitting}
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        field.onChange(workspace.visibility);
                        setShowVisibilityDialog(false);
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
          />
        </div>

        {isEditing && (
          <>
            <Separator />
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button type="submit" form="workspace-form" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this workspace?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All data for this workspace will be removed permanently.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-muted-foreground">
            You will be redirected to your workspace list after deletion.
          </div>
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
