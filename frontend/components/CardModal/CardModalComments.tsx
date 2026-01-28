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
}: CardModalCommentsProps) {
  return (
    <div className="border border-accent rounded-lg p-4 bg-trello-card-bg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-trello-text-secondary" />
          <h3 className="text-sm font-semibold text-trello">Comments and activity</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-trello-secondary hover:bg-trello-hover">
          Show details
        </Button>
      </div>

      {/* Comment input */}
      <div className="mb-4">
        <Textarea
          ref={commentTextareaRef}
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => onChangeNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              onAddComment();
            }
          }}
          className="min-h-[80px] resize-none border-accent"
        />
      </div>

      {/* Comments/activity list */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-trello-text-secondary italic">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className={`w-8 h-8 rounded-full ${getAvatarColor(comment.author?.name || comment.author?.email)} flex items-center justify-center text-xs font-medium text-white shrink-0`}>
                {comment.author?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  (comment.author?.name || comment.author?.email || "U")[0].toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-trello">
                  <span className="font-semibold">{comment.author?.name || "Unknown"}</span>
                  {" "}
                  {editingCommentId === comment.id ? (
                    <div className="mt-2">
                      <Textarea
                        value={editingCommentText}
                        onChange={(e) => onEditCommentTextChange(e.target.value)}
                        className="min-h-[60px] resize-none border-accent"
                        autoFocus
                      />
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={() => onSaveEditComment(comment.id)}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={onCancelEditComment}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <span>{comment.text}</span>
                  )}
                </div>
                <div className="text-xs text-trello-text-secondary mt-1">
                  {formatCommentDate(comment.createdAt)}
                </div>
                {!editingCommentId && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-auto p-0 text-xs text-trello-secondary hover:text-trello"
                      onClick={() => onStartEditComment(comment)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-auto p-0 text-xs text-trello-secondary hover:text-red-600"
                      onClick={() => onDeleteComment(comment.id)}
                    >
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
