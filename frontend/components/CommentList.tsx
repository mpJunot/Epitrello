"use client";

import React from "react";

export default function CommentList({ comments }: { comments?: { id: string; authorName?: string; content?: string; createdAt?: string }[] }) {
  if (!comments || comments.length === 0) return <div className="text-sm text-gray-500">No comments yet</div>;
  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <div key={c.id} className="p-2 bg-white rounded shadow-sm">
          <div className="text-xs text-gray-500">{c.authorName} • {c.createdAt}</div>
          <div className="mt-1 text-sm text-gray-800">{c.content}</div>
        </div>
      ))}
    </div>
  );
}
