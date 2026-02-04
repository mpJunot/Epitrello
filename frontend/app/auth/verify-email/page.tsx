"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      toast.error("Invalid link: token missing.");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    const verify = async () => {
      const graphqlEndpoint = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql";
      const query = `mutation VerifyEmail($token: String!) { verifyEmail(token: $token) { message } }`;

      try {
        const res = await fetch(graphqlEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, variables: { token } }),
        });

        if (cancelled) return;

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Server error: ${res.status}`);
        }

        const json = await res.json();
        if (json.errors && json.errors.length) {
          throw new Error(json.errors[0].message || "Verification error");
        }

        setStatus("success");
        toast.success("Email verified. You can sign in.");
        window.location.href = "/auth/login?verified=1";
      } catch (err: unknown) {
        if (cancelled) return;
        setStatus("error");
        const message = err instanceof Error ? err.message : "Invalid or expired link.";
        toast.error(message);
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-trello-hover">
      <div className="max-w-md w-full">
        <div className="bg-trello-card-bg shadow rounded-2xl p-6 text-center">
          {status === "loading" && (
            <>
              <h2 className="text-lg font-semibold mb-2">Verifying...</h2>
              <p className="text-sm text-trello-secondary">Please wait.</p>
            </>
          )}
          {status === "success" && (
            <>
              <h2 className="text-lg font-semibold mb-2">Email verified</h2>
              <p className="text-sm text-trello-secondary mb-4">Redirecting to sign in...</p>
            </>
          )}
          {status === "error" && (
            <>
              <h2 className="text-lg font-semibold mb-2">Invalid or expired link</h2>
              <p className="text-sm text-trello-secondary mb-4">
                This verification link is no longer valid. You can sign in or request a new verification email.
              </p>
              <a href="/auth/login">
                <Button variant="default" className="w-full">
                  Go to sign in
                </Button>
              </a>
            </>
          )}
          {status === "idle" && (
            <>
              <h2 className="text-lg font-semibold mb-2">Verifying...</h2>
              <p className="text-sm text-trello-secondary">Loading.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-6 bg-trello-hover">
          <div className="max-w-md w-full">
            <div className="bg-trello-card-bg shadow rounded-2xl p-6 text-center">
              <h2 className="text-lg font-semibold mb-2">Verifying...</h2>
              <p className="text-sm text-trello-secondary">Please wait.</p>
            </div>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
