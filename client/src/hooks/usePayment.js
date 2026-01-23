// hooks/usePayment.js - Fixed version
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { initiateSubscriptionService, verifySubscriptionService } from '../services/paymentService';

export const useInitiateSubscription = () => {
    return useMutation({
        mutationFn: (plan) => initiateSubscriptionService(plan),
        onSuccess: (data) => {
            if (data.payment_url) {
                toast.info("Redirecting to Khalti for payment...");
                window.location.href = data.payment_url;
            } else {
                 toast.error("Failed to get payment URL.");
            }
        },
        onError: (error) => {
            toast.error(error.message || "Could not start the payment process.");
        },
    });
};

export const useVerifySubscription = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (verificationData) => verifySubscriptionService(verificationData),
        onSuccess: (data) => {
            toast.success(data.message || "Your subscription has been upgraded!");
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
        onError: (error) => {
            toast.error(error.message || "We couldn't verify your payment.");
        },
    });
};