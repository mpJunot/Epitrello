import { toast as sonnerToast } from "sonner";

export const toast = {
  success: (message: string, title?: string) => {
    sonnerToast.success(title || "Success", {
      description: message,
    });
  },
  error: (message: string, title?: string) => {
    sonnerToast.error(title || "Error", {
      description: message,
    });
  },
  info: (message: string, title?: string) => {
    sonnerToast.info(title || "Info", {
      description: message,
    });
  },
};
