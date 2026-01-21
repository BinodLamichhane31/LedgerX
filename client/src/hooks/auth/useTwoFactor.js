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
            toast.success(data.message || "2FA Enabled Successfully");
            queryClient.invalidateQueries(['profile']);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to verify setup");
        }
    });
};

export const useDisableMFA = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: disableMFAService,
        onSuccess: (data) => {
            toast.success(data.message || "2FA Disabled");
            queryClient.invalidateQueries(['profile']);
        },
        onError: (error) => {
             toast.error(error.message || "Failed to disable MFA");
        }
    });
};
