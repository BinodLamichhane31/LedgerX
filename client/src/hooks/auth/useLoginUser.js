import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/authProvider";
import { loginUserService } from "../../services/authService";

export const useLoginUser = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginUserService,
    mutationKey: ['login'],
    onSuccess: (response) => {
      // Check if MFA is required
      if (response.mfaRequired) {
        // Don't call login() or navigate to dashboard
        // The LoginForm component will handle navigation to MFA verify page
        return;
      }

      const { user, shops } = response.data;

      login(response);
      
      toast.success(response.message || "Login Successful");

      if (user.role === 'admin') {
        navigate("/admin/users", { replace: true });
      } else if (shops && shops.length > 0) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/create-first-shop", { replace: true });
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || "Login Failure");
    }
  });
};