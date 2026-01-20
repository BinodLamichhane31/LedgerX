import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { resetPasswordService } from "../../services/authService";

export const useResetPassword = () => {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: ({ token, ...data }) => resetPasswordService(token, data),
    onSuccess: (response) => {
      toast.success(response.message || "Password reset successful. Please login.");
      navigate("/login");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reset password.");
    }
  });
  
  return { ...mutation, isLoading: mutation.isPending };
};
