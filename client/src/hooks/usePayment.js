// hooks/usePayment.js - Fixed version
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { initiateSubscriptionService, verifySubscriptionService } from '../services/paymentService';

// Updated eSewa form submission function
const postToEsewa = (paymentDetails) => {
    const form = document.createElement('form');
    form.setAttribute('method', 'POST');
    form.setAttribute('action', paymentDetails.payment_url);
    form.setAttribute('target', '_self');

    // eSewa required fields with correct names
    const fields = {
        tAmt: paymentDetails.tAmt,           // Total amount
        amt: paymentDetails.amt,             // Amount  
        txAmt: paymentDetails.txAmt,         // Tax amount
        psc: paymentDetails.psc,             // Product service charge
        pdc: paymentDetails.pdc,             // Product delivery charge
        pid: paymentDetails.pid,             // Product ID
        scd: paymentDetails.scd,             // Merchant code
        su: paymentDetails.su,               // Success URL
        fu: paymentDetails.fu                // Failure URL
    };

    // Create hidden form fields
    Object.keys(fields).forEach(key => {
        if (fields[key] !== undefined) {
            const hiddenField = document.createElement('input');
            hiddenField.setAttribute('type', 'hidden');
            hiddenField.setAttribute('name', key);
            hiddenField.setAttribute('value', fields[key]);
            form.appendChild(hiddenField);
        }
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
};

export const useInitiateSubscription = () => {
    return useMutation({
        mutationFn: initiateSubscriptionService,
        onSuccess: (data) => {
            toast.info("Redirecting to eSewa for payment...");
            
            // Small delay to ensure toast is shown
            setTimeout(() => {
                postToEsewa(data.paymentDetails);
            }, 1000);
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