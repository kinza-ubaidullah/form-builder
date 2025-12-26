import { useState } from 'react';
import {
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, Zap } from "lucide-react";

interface StripePaymentFormProps {
    amount: number;
    onSuccess: () => void;
    onError: (error: string) => void;
}

export function StripePaymentForm({ amount, onSuccess, onError }: StripePaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // No return_url needed if we handle it here or if it's a synchronous payment
                // But Stripe often requires one. We can use a hash or current URL.
                return_url: window.location.origin + '/?payment_success=true',
            },
            redirect: 'if_required',
        });

        if (error) {
            onError(error.message || 'Payment failed');
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess();
        } else {
            onError('Payment status: ' + paymentIntent?.status);
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />

            <div className="flex items-center justify-center gap-2 py-3 bg-green-50/30 rounded-xl border border-green-100/50">
                <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                <span className="text-[9px] font-black text-green-700/60 uppercase tracking-widest">Secure SSL Encrypted</span>
            </div>

            <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-black bg-[#2196F3] hover:bg-[#1e88e5] text-white shadow-lg shadow-[#2196F3]/20 transition-all active:scale-[0.99]"
                disabled={isProcessing || !stripe || !elements}
            >
                {isProcessing ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 fill-white" />
                        Confirm Payment • ${amount.toFixed(2)}
                    </div>
                )}
            </Button>
        </form>
    );
}
