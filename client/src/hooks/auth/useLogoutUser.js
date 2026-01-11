import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutUserService } from "../../services/authService";
import { useContext } from "react";
import { AuthContext } from "../../auth/authProvider";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const useLogoutUser = () => {
  const { logout } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutUserService,
    mutationKey: ["logout"],
    onSuccess: (data) => {
      // Show success message
      toast.success(data.message || "Logged out successfully");
      
      // Call the context logout function which handles everything
      logout();
    },
    onError: (error) => {
      // Even on error, we should still logout locally
      toast.error(error.response?.data?.message || "Logout failed. Please try again.");
      
      // Call the context logout function which handles everything
      logout();
    }
  });
};
