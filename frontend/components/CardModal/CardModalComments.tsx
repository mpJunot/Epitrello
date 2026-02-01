'use client';

import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Comment } from './types';
import { getAvatarColor } from '@/lib/utils/avatar-colors';

interface CardModalCommentsProps {
  comments: Comment[];
  newComment: string;
  editingCommentId: string | null;
  editingCommentText: string;
  commentTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onChangeNewComment: (value: string) => void;
  onAddComment: () => void;
  onStartEditComment: (comment: Comment) => void;
  onEditCommentTextChange: (value: string) => void;
  onSaveEditComment: (id: string) => void;
  onCancelEditComment: () => void;
  onDeleteComment: (id: string) => void;
  formatCommentDate: (date: string) => string;
  readOnly?: boolean;
}

export function CardModalComments({
  comments,
  newComment,
  editingCommentId,
  editingCommentText,
  commentTextareaRef,
  onChangeNewComment,
  onAddComment,
  onStartEditComment,
  onEditCommentTextChange,
  onSaveEditComment,
  onCancelEditComment,
  onDeleteComment,
  formatCommentDate,
  readOnly = false,
}: CardModalCommentsProps) {
  return (
    <div className='flex flex-col h-full'>
      {/* Header style Trello : simple, pas de bordure */}
      <div className='flex items-center gap-2 shrink-0 pb-3 border-b border-accent/50'>
        <MessageSquare className='w-4 h-4 text-trello-text-secondary' />
        <h3 className='text-sm font-semibold text-trello'>
          Comments and activity
        </h3>
      </div>

      {/* Zone d’ajout de commentaire style Trello : compacte, avatar + champ + Save */}
      {!readOnly && (
        <div className='flex gap-3 py-4 border-b border-accent/50'>
          <div className='w-8 h-8 rounded-full bg-trello-blue shrink-0 flex items-center justify-center text-xs font-medium text-white'>
            +
          </div>
          <div className='flex-1 min-w-0 flex flex-col gap-2'>
            <Textarea
              ref={commentTextareaRef}
              placeholder='Write a comment...'
              value={newComment}
              onChange={(e) => onChangeNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  onAddComment();
                }
              }}
              className='min-h-[36px] py-2 px-3 text-sm resize-none border-accent rounded-md bg-trello-hover/50 focus:bg-trello-card-bg placeholder:text-trello-text-secondary'
              rows={1}
            />
            {newComment.trim() && (
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  className='bg-trello-blue hover:bg-trello-blue/90 text-white h-8 text-xs'
                  onClick={onAddComment}
                >
                  Save
                </Button>
                <Button
                  size='sm'
                  variant='ghost'
                  className='h-8 text-xs text-trello-secondary hover:text-trello'
                  onClick={() => onChangeNewComment('')}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Liste des commentaires style Trello : avatar, nom + date (lien bleu), texte, Edit · Delete au survol */}
      <div className='flex-1 overflow-y-auto pt-3 space-y-4'>
        {comments.length === 0 ? (
          <p className='text-sm text-trello-text-secondary'>
            No comments yet
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className='flex gap-3 group'>
              <div
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-medium text-white ${getAvatarColor(comment.author?.name || comment.author?.email)}`}
              >
                {comment.author?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className='w-full h-full object-cover rounded-full'
                  />
                ) : (
                  (comment.author?.name ||
                    comment.author?.email ||
                    'U')[0].toUpperCase()
                )}
              </div>
              <div className='flex-1 min-w-0'>
                {editingCommentId === comment.id ? (
                  <div className='space-y-2'>
                    <Textarea
                      value={editingCommentText}
                      onChange={(e) =>
                        onEditCommentTextChange(e.target.value)
                      }
                      className='min-h-[60px] text-sm resize-none border-accent rounded-md bg-trello-hover/50 py-2 px-3'
                      autoFocus
                    />
                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        className='bg-trello-blue hover:bg-trello-blue/90 text-white h-8 text-xs'
                        onClick={() => onSaveEditComment(comment.id)}
                      >
                        Save
                      </Button>
                      <Button
                        size='sm'
                        variant='ghost'
                        className='h-8 text-xs text-trello-secondary'
                        onClick={onCancelEditComment}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className='text-sm text-trello'>
                      <span className='font-semibold'>
                        {comment.author?.name || 'Unknown'}
                      </span>
                      <span className='text-trello-text-secondary mx-1'>·</span>
                      <span className='text-xs text-blue-500 underline underline-offset-1 cursor-pointer hover:text-blue-400'>
                        {formatCommentDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className='text-sm text-trello mt-0.5 whitespace-pre-wrap wrap-break-word'>
                      {comment.text}
                    </p>
                    {!readOnly && (
                      <div className='flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                        <button
                          type='button'
                          className='text-xs text-trello-secondary hover:text-trello hover:underline'
                          onClick={() => onStartEditComment(comment)}
                        >
                          Edit
                        </button>
                        <span className='text-trello-text-secondary'>·</span>
                        <button
                          type='button'
                          className='text-xs text-trello-secondary hover:text-red-500 hover:underline'
                          onClick={() => onDeleteComment(comment.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
