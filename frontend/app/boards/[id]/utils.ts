import { toast } from "@/lib/toast";

export function handleAsyncError(error: unknown, action: string): void {
  const message = error instanceof Error ? error.message : `Failed to ${action}`;
  console.error(`[${action}] error:`, error);
  toast.error(message, `Error: ${action}`);
}

export function logAction(emoji: string, message: string, data?: unknown): void {
  if (data) {
    console.log(`${emoji} ${message}`, data);
  } else {
    console.log(`${emoji} ${message}`);
  }
}
