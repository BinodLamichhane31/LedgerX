import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { forgotPasswordService } from "../../services/authService";

export const useForgotPassword = () => {
  const mutation = useMutation({
    mutationFn: forgotPasswordService,
    onSuccess: (response) => {
      // Always show success message
      toast.success(response.message || "If an account exists, a reset link has been sent.");
    },
    onError: (error) => {
      // Even on error, be careful not to reveal too much if it's user not found (though backend handles that).
      // If it's a server error or rate limit, we might show a generic message.
      toast.error(error.message || "Request failed. Please try again.");
    }
  });

  return { ...mutation, isLoading: mutation.isPending };
};
