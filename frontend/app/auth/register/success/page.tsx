"use client";

import React from "react";

export default function RegisterSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-trello-hover">
      <div className="max-w-md w-full text-center">
        <div className="bg-trello-card-bg shadow rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-2">Account created!</h2>
          <p className="text-sm text-trello-secondary mb-4">A confirmation email has been sent. Check your inbox to activate your account.</p>
          <a href="/auth/login" className="inline-block px-4 py-2 rounded-lg bg-trello-blue text-white">Go to login</a>
        </div>
      </div>
    </div>
  );
}
