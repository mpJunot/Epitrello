import { toast as showToast } from "@/components/ui/use-toast";

export const toast = {
  success: (message: string, title?: string) => {
    showToast({
      variant: "success",
      title: title || "Success",
      description: message,
    });
  },
  error: (message: string, title?: string) => {
    showToast({
      variant: "destructive",
      title: title || "Error",
      description: message,
    });
  },
  info: (message: string, title?: string) => {
    showToast({
      variant: "default",
      title: title || "Info",
      description: message,
    });
  },
};
