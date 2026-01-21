import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setupMFAService, verifySetupService, disableMFAService } from '../../services/mfaService';
import { toast } from 'react-toastify';

export const useSetupMFA = () => {
    return useMutation({ mutationFn: setupMFAService });
};

export const useVerifySetup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: verifySetupService,
        onSuccess: (data) => {
            toast.success(data.message || "2FA Enabled successfully");
            queryClient.invalidateQueries(['profile']);
        },
        onError: (error) => {
            toast.error("Invalid verification code. Please try again.");
        }
    });
};

export const useDisableMFA = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: disableMFAService,
        onSuccess: (data) => {
            toast.success(data.message || "2FA Disabled successfully");
            queryClient.invalidateQueries(['profile']);
        },
        onError: (error) => {
             const message = error.response?.status === 401 ? "Incorrect password or authentication code." : "Something went wrong while disabling MFA. Please try again.";
             toast.error(message);
        }
    });
};
