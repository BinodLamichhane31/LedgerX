import { useMutation, useQuery } from "@tanstack/react-query";
import { initiateSubscriptionService, verifySubscriptionService, getPaymentHistoryService } from "../services/paymentService";
import { toast } from "react-toastify";

export const usePayment = () => {
    return useMutation({
        mutationFn: initiateSubscriptionService,
        onSuccess: (data) => {
            if (data.payment_url) {
                window.location.href = data.payment_url;
            }
        },
        onError: (error) => {
            toast.error(error.message || "Something went wrong with the payment initiation.");
        }
    });
};

export const useVerifyPayment = () => {
    return useMutation({
        mutationFn: verifySubscriptionService,
        onSuccess: (data) => {
            toast.success(data.message || "Payment verified successfully!");
        }
    });
};

export const useGetPaymentHistory = () => {
    return useQuery({
        queryKey: ['payment_history'],
        queryFn: getPaymentHistoryService
    });
};