import { useMutation } from "@tanstack/react-query"; // useMutation for (POST/UPDATE/PATCH/DELETE)
import { registerUserService } from "../../services/authService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const useRegisterUser = () =>{
    return useMutation(
        {
            mutationFn: registerUserService, 
            mutationKey:['register'], 
            onSuccess: (data) =>{
                toast.success(data.message || "Registration Successful")
            },
            onError: (err) =>{
                toast.error(err.message || "Registration Failed")

            }
        }
    )
}
