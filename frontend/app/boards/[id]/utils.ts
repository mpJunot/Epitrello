export function handleAsyncError(error: unknown, action: string): void {
  const message = error instanceof Error ? error.message : `Failed to ${action}`;
  console.error(`❌ ${action} error:`, error);
  alert(`Error: ${message}`);
}

export function logAction(emoji: string, message: string, data?: any): void {
  if (data) {
    console.log(`${emoji} ${message}`, data);
  } else {
    console.log(`${emoji} ${message}`);
  }
}
