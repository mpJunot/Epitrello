import React from 'react';
import Image from 'next/image';
import { Comment, UserRef } from './types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Edit2, Trash2 } from 'lucide-react';

interface ActivitySectionProps {
  currentUser: UserRef;
  comments: Comment[];
  newComment: string;
  onChangeNewComment: (v: string) => void;
  onAddComment: () => void;
  onStartEditComment: (comment: Comment) => void;
  editingCommentId: string | null;
  editingCommentText: string;
  onEditCommentTextChange: (v: string) => void;
  onSaveEditComment: (id: string) => void;
  onCancelEditComment: () => void;
  onDeleteComment: (id: string) => void;
  formatCommentDate: (date: string) => string;
  commentTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export default function ActivitySection({
  currentUser,
  comments,
  newComment,
  onChangeNewComment,
  onAddComment,
  onStartEditComment,
  editingCommentId,
  editingCommentText,
  onEditCommentTextChange,
  onSaveEditComment,
  onCancelEditComment,
  onDeleteComment,
  formatCommentDate,
  commentTextareaRef,
}: ActivitySectionProps) {
  return (
    <div>
      <div className='flex items-center gap-2 mb-3'>
        <MessageSquare className='w-5 h-5 text-trello-text-secondary' />
        <h3 className='text-sm font-semibold text-trello'>Activity</h3>
      </div>

      <div className='ml-7 mb-4'>
        <div className='flex gap-2 items-start'>
          <div className='shrink-0 w-8 h-8 rounded-full bg-trello-blue text-white flex items-center justify-center text-xs font-medium'>
            {currentUser.avatar ? (
              <Image
                src={currentUser.avatar}
                alt={currentUser.name || 'User'}
                width={32}
                height={32}
                className='w-full h-full rounded-full object-cover'
                unoptimized
              />
            ) : (
              (currentUser.name || 'User')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
            )}
          </div>
          <div className='flex-1'>
            <Textarea
              ref={commentTextareaRef}
              value={newComment}
              onChange={(e) => onChangeNewComment(e.target.value)}
              placeholder='Write a comment...'
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  onAddComment();
                }
              }}
            />
            {newComment.trim() && (
              <div className='flex gap-2 mt-2'>
                <Button onClick={onAddComment} size='sm'>
                  Save
                </Button>
                <Button
                  onClick={() => onChangeNewComment('')}
                  variant='secondary'
                  size='sm'
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='ml-7 space-y-3'>
        {comments.length === 0 ? (
          <p className='text-sm text-trello-text-secondary italic'>
            No comments yet
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className='flex gap-2 items-start group'>
              <div className='shrink-0 w-8 h-8 rounded-full bg-trello-blue text-white flex items-center justify-center text-xs font-medium'>
                {comment.author.avatar ? (
                  <Image
                    src={comment.author.avatar}
                    alt={comment.author.name || 'User'}
                    width={32}
                    height={32}
                    className='w-full h-full rounded-full object-cover'
                    unoptimized
                  />
                ) : (
                  (comment.author.name || 'User')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                )}
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-1'>
                  <span className='text-sm font-medium text-trello'>
                    {comment.author.name || 'User'}
                  </span>
                  <span className='text-xs text-trello-text-secondary'>
                    {formatCommentDate(comment.createdAt)}
                  </span>
                </div>

                {editingCommentId === comment.id ? (
                  <div>
                    <Textarea
                      value={editingCommentText}
                      onChange={(e) => onEditCommentTextChange(e.target.value)}
                      rows={3}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault();
                          onSaveEditComment(comment.id);
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          onCancelEditComment();
                        }
                      }}
                    />
                    <div className='flex gap-2 mt-2'>
                      <Button
                        onClick={() => onSaveEditComment(comment.id)}
                        size='sm'
                      >
                        Save
                      </Button>
                      <Button
                        onClick={onCancelEditComment}
                        variant='secondary'
                        size='sm'
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='bg-trello-hover px-3 py-2 rounded-md text-sm text-trello whitespace-pre-wrap wrap-break-word'>
                    {comment.text}
                  </div>
                )}

                {editingCommentId !== comment.id &&
                  comment.author.id === currentUser.id && (
                    <div className='flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <Button
                        onClick={() => onStartEditComment(comment)}
                        variant='ghost'
                        size='sm'
                        className='text-xs h-auto p-0'
                      >
                        <Edit2 className='w-3 h-3 mr-1' />
                        Edit
                      </Button>
                      <span className='text-xs text-trello-border'>•</span>
                      <Button
                        onClick={() => onDeleteComment(comment.id)}
                        variant='ghost'
                        size='sm'
                        className='text-xs text-red-600 hover:text-red-700 h-auto p-0'
                      >
                        <Trash2 className='w-3 h-3 mr-1' />
                        Delete
                      </Button>
                    </div>
                  )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
