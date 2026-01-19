import React from "react";
import { Comment, UserRef } from "./types";

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
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        <h3 className="text-sm font-semibold text-gray-700">Activity</h3>
      </div>

      <div className="ml-7 mb-4">
        <div className="flex gap-2 items-start">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name || "User"} className="w-full h-full rounded-full object-cover" />
            ) : (
              (currentUser.name || "User")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <textarea
              ref={commentTextareaRef}
              value={newComment}
              onChange={(e) => onChangeNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  onAddComment();
                }
              }}
            />
            {newComment.trim() && (
              <div className="flex gap-2 mt-2">
                <button onClick={onAddComment} className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors">
                  Save
                </button>
                <button onClick={() => onChangeNewComment("")} className="px-3 py-1.5 text-gray-600 text-sm rounded hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ml-7 space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-2 items-start group">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-medium">
                {comment.author.avatar ? (
                  <img src={comment.author.avatar} alt={comment.author.name || "User"} className="w-full h-full rounded-full object-cover" />
                ) : (
                  (comment.author.name || "User")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{comment.author.name || "User"}</span>
                  <span className="text-xs text-gray-500">{formatCommentDate(comment.createdAt)}</span>
                </div>

                {editingCommentId === comment.id ? (
                  <div>
                    <textarea
                      value={editingCommentText}
                      onChange={(e) => onEditCommentTextChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault();
                          onSaveEditComment(comment.id);
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          onCancelEditComment();
                        }
                      }}
                    />
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => onSaveEditComment(comment.id)} className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors">
                        Save
                      </button>
                      <button onClick={onCancelEditComment} className="px-3 py-1.5 text-gray-600 text-sm rounded hover:bg-gray-100 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 px-3 py-2 rounded-md text-sm text-gray-700 whitespace-pre-wrap break-words">
                    {comment.text}
                  </div>
                )}

                {editingCommentId !== comment.id && comment.author.id === currentUser.id && (
                  <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onStartEditComment(comment)} className="text-xs text-gray-500 hover:text-gray-700 underline">
                      Edit
                    </button>
                    <span className="text-xs text-gray-300">•</span>
                    <button onClick={() => onDeleteComment(comment.id)} className="text-xs text-gray-500 hover:text-red-600 underline">
                      Delete
                    </button>
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
