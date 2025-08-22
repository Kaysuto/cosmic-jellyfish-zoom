import { toast } from "sonner";

export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showError = (message: string) => {
  toast.error(message);
};

export const showLoading = (message: string, options?: { id?: string | number }) => {
  return toast.loading(message, options);
};

export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};