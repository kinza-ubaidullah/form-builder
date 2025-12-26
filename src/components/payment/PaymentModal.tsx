import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Loader2, CheckCircle2, Zap, Landmark, User, Mail, Phone, DollarSign, Globe, Flag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { profilesApi } from "@/db/api";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripePaymentForm } from './StripePaymentForm';
import { supabase } from "@/db/supabase";
import { initializePaddle, Paddle } from '@paddle/paddle-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    templateTitle?: string;
}

type PaymentMethod = 'card' | 'hbl' | 'payoneer' | 'sadapay' | 'easypaisa' | 'jazzcash' | 'payfast' | 'paddle';
type PaymentRegion = 'pakistan' | 'international';

export function PaymentModal({ open, onOpenChange, templateTitle }: PaymentModalProps) {
    const { profile, refreshProfile } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
    const [region, setRegion] = useState<PaymentRegion>('pakistan');
    const [payfastData, setPayfastData] = useState<any>(null);
    const [paddle, setPaddle] = useState<Paddle>();

    useEffect(() => {
        initializePaddle({
            environment: 'sandbox',
            token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN || 'test_token'
        }).then((paddleInstance) => {
            if (paddleInstance) setPaddle(paddleInstance);
        });
    }, []);

    // Form states for different methods
    const [amount, setAmount] = useState('5.00');
    const [senderName, setSenderName] = useState('');
    const [transactionId, setTransactionId] = useState('');

    const [payoneerEmail, setPayoneerEmail] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loadingStripe, setLoadingStripe] = useState(false);

    useEffect(() => {
        if (open) {
            if (region === 'international') {
                setSelectedMethod('paddle');
            } else {
                setSelectedMethod('payfast');
            }
        }
    }, [open, region]);

    useEffect(() => {
        if (open && selectedMethod === 'card' && parseFloat(amount) >= 5) {
            initiateStripePayment();
        }
    }, [open, selectedMethod, amount]);

    const initiateStripePayment = async () => {
        try {
            setLoadingStripe(true);
            const { data, error } = await supabase.functions.invoke('create-payment-intent', {
                body: {
                    amount: Math.round(parseFloat(amount) * 100),
                    metadata: { userId: profile?.id, type: 'template_unlock', template: templateTitle }
                },
            });

            if (error) throw error;
            setClientSecret(data.clientSecret);
        } catch (error) {
            console.error("Stripe initialization failed:", error);
            toast({
                title: "Error",
                description: "Failed to initialize card payment.",
                variant: "destructive",
            });
        } finally {
            setLoadingStripe(false);
        }
    };

    const handleStripeSuccess = async () => {
        if (!profile) return;
        try {
            await profilesApi.updateStatus(profile.id, {
                is_premium: true,
                payment_method: 'card',
                amount: parseFloat(amount),
                payment_details: { stripe: true, template: templateTitle }
            });

            await refreshProfile();
            setSuccess(true);
            toast({
                title: "Payment Successful!",
                description: `You have successfully unlocked Premium for $${amount}.`,
            });
            setTimeout(() => {
                onOpenChange(false);
                setSuccess(false);
            }, 3000);
        } catch (error) {
            console.error("Failed to update profile after payment:", error);
        }
    };

    const paymentMethods = region === 'pakistan' ? [
        { id: 'payfast' as PaymentMethod, name: 'PayFast', icon: Zap, color: '[#2196F3]', desc: 'Cards / Wallets' },
        { id: 'card' as PaymentMethod, name: 'Stripe', icon: CreditCard, color: 'slate', desc: 'Secure payment' },
        { id: 'easypaisa' as PaymentMethod, name: 'EasyPaisa', icon: Phone, color: '[#00A950]', desc: 'Mobile wallet' },
        { id: 'jazzcash' as PaymentMethod, name: 'JazzCash', icon: Phone, color: '[#FFB800]', desc: 'Mobile wallet' },
        { id: 'hbl' as PaymentMethod, name: 'Habib Bank (HBL)', icon: Landmark, color: '[#1c2c54]', desc: 'Bank transfer' },
    ] : [
        { id: 'paddle' as PaymentMethod, name: 'Paddle Checkout', icon: Globe, color: 'slate', desc: 'Secure International' },
        { id: 'card' as PaymentMethod, name: 'Stripe', icon: CreditCard, color: 'slate', desc: 'Direct Cards' },
        { id: 'payoneer' as PaymentMethod, name: 'Payoneer', icon: Mail, color: '[#ff4800]', desc: 'International' },
    ];

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        if (parseFloat(amount) < 5) {
            toast({
                title: "Minimum Amount",
                description: "The minimum payment amount is $5.00",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);

            // Manual payment - request activation
            const paymentDetails: Record<string, any> = {
                senderName
            };

            if (selectedMethod === 'payoneer') {
                paymentDetails.email = payoneerEmail;
            } else if (selectedMethod === 'sadapay') {
                paymentDetails.accountNumber = accountNumber;
            } else if (selectedMethod === 'easypaisa' || selectedMethod === 'jazzcash') {
                paymentDetails.mobileNumber = mobileNumber;
            }

            await profilesApi.updateStatus(profile.id, {
                upgrade_requested: true,
                payment_method: selectedMethod,
                transaction_id: transactionId,
                amount: parseFloat(amount),
                payment_details: paymentDetails,
                full_name: senderName || profile.full_name
            });

            await refreshProfile();
            setSuccess(true);

            toast({
                title: "Request Sent",
                description: "Your payment confirmation has been sent for verification.",
            });

            setTimeout(() => {
                onOpenChange(false);
                setSuccess(false);
            }, 3000);

        } catch (error) {
            console.error("Payment failed:", error);
            toast({
                title: "Error",
                description: "There was an error processing your request. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const initiatePayFast = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.functions.invoke('initiate-payfast', {
                body: {
                    amount: parseFloat(amount),
                    orderId: `TMPL-${Date.now()}`,
                    customerEmail: profile?.email || '',
                    customerName: profile?.full_name || 'Customer'
                }
            });

            if (error) throw error;
            setPayfastData(data);
        } catch (error) {
            console.error("PayFast failed:", error);
            toast({ title: "Error", description: "Failed to initiate PayFast", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handlePaddleCheckout = () => {
        if (!paddle || !profile) return;
        paddle.Checkout.open({
            items: [{ priceId: 'pri_template_unlock', quantity: 1 }],
            customer: { email: profile.email || '' },
            customData: { user_id: profile.id, type: 'template_unlock' }
        });
    };

    const renderFormFields = () => {
        if (selectedMethod === 'payfast') {
            return (
                <div className="space-y-4">
                    <div className="bg-[#2196F3]/5 border border-[#2196F3]/20 rounded-2xl p-4 text-center">
                        <p className="text-sm font-bold text-[#2196F3]">Pay securely via PayFast Pakistan</p>
                    </div>
                    {payfastData ? (
                        <form action={payfastData.url} method="POST">
                            {Object.entries(payfastData.params).map(([key, value]) => (
                                <input key={key} type="hidden" name={key} value={value as string} />
                            ))}
                            <Button className="w-full h-12 rounded-2xl bg-[#2196F3] text-white font-black shadow-lg">
                                Complete at PayFast.pk
                            </Button>
                        </form>
                    ) : (
                        <Button
                            className="w-full h-12 rounded-2xl bg-[#2196F3] text-white font-black shadow-lg"
                            onClick={initiatePayFast}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Initiate PayFast Payment"}
                        </Button>
                    )}
                </div>
            );
        }

        if (selectedMethod === 'paddle') {
            return (
                <div className="space-y-4">
                    <div className="bg-[#2196F3]/5 border border-[#2196F3]/10 rounded-2xl p-6 text-center">
                        <Globe className="h-10 w-10 text-[#2196F3] mx-auto mb-4" />
                        <p className="text-sm font-bold text-slate-700 mb-2">Secure International Checkout</p>
                        <p className="text-[10px] text-slate-400 mb-6 uppercase tracking-widest font-black">Powered by Paddle</p>
                        <Button
                            className="w-full h-12 rounded-2xl bg-black text-white font-black shadow-xl"
                            onClick={handlePaddleCheckout}
                            disabled={!paddle}
                        >
                            {paddle ? "Open Checkout" : <Loader2 className="h-4 w-4 animate-spin" />}
                        </Button>
                    </div>
                </div>
            );
        }

        if (selectedMethod === 'card') {
            return (
                <div className="space-y-4">
                    {loadingStripe ? (
                        <div className="flex flex-col items-center justify-center p-12 space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-[#2196F3]" />
                            <p className="text-sm font-bold text-slate-500">Initializing secure payment...</p>
                        </div>
                    ) : clientSecret ? (
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <StripePaymentForm
                                amount={parseFloat(amount)}
                                onSuccess={handleStripeSuccess}
                                onError={(err) => toast({ title: "Payment Error", description: err, variant: "destructive" })}
                            />
                        </Elements>
                    ) : (
                        <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 text-center">
                            <p className="text-sm font-bold text-amber-800">
                                Enter an amount of at least $5.00 to pay via card.
                            </p>
                        </div>
                    )}
                </div>
            );
        }

        const methodDetailsMap = {
            hbl: { name: 'Habib Bank Limited', color: '#1c2c54', icon: Landmark, acc: '1234 5678 9012 3456' },
            payoneer: { name: 'Payoneer', color: '#ff4800', icon: Mail, acc: 'pay@formbuilder.com' },
            sadapay: { name: 'SadaPay', color: '#FF4D4D', icon: Phone, acc: '+92 300 1122334' },
            easypaisa: { name: 'EasyPaisa', color: '#00A950', icon: Phone, acc: '+92 345 1122334' },
            jazzcash: { name: 'JazzCash', color: '#FFB800', icon: Phone, acc: '+92 301 1122334' },
        };

        const methodDetails = methodDetailsMap[selectedMethod as keyof typeof methodDetailsMap];

        return (
            <div className="space-y-4">
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 text-center">Transfer to this account</div>
                    <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                            <methodDetails.icon className="h-6 w-6" style={{ color: methodDetails.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-black uppercase" style={{ color: methodDetails.color }}>{methodDetails.name}</div>
                            <div className="text-sm font-bold text-slate-900">FormBuilder Solutions</div>
                            <div className="text-xs font-mono font-black text-slate-400">{methodDetails.acc}</div>
                        </div>
                    </div>
                </div>

                {selectedMethod === 'payoneer' && (
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Payoneer Email</Label>
                        <Input
                            type="email"
                            placeholder="your@email.com"
                            className="h-11 bg-slate-50/50 border-slate-200 rounded-xl font-bold"
                            value={payoneerEmail}
                            onChange={(e) => setPayoneerEmail(e.target.value)}
                        />
                    </div>
                )}

                {selectedMethod === 'sadapay' && (
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your SadaPay Account</Label>
                        <Input
                            placeholder="sadapay.me/yourname"
                            className="h-11 bg-slate-50/50 border-slate-200 rounded-xl font-bold"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                        />
                    </div>
                )}

                {(selectedMethod === 'easypaisa' || selectedMethod === 'jazzcash') && (
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Registered Mobile</Label>
                        <Input
                            placeholder="+92 300 1234567"
                            className="h-11 bg-slate-50/50 border-slate-200 rounded-xl font-bold"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                        />
                    </div>
                )}

                <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sender Name</Label>
                    <div className="relative group">
                        <Input
                            placeholder="Your Account Name"
                            className="h-11 bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                        />
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#2196F3] transition-colors" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Transaction ID</Label>
                        <Input
                            placeholder="Receipt ID"
                            className="h-11 bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount</Label>
                        <div className="relative group">
                            <Input
                                type="number"
                                step="0.01"
                                min="5"
                                className="h-11 bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold pl-8"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handlePayment}
                    className="w-full h-12 rounded-xl text-base font-black bg-[#2196F3] hover:bg-[#1e88e5] text-white shadow-lg shadow-[#2196F3]/20"
                    disabled={loading || !transactionId || !senderName}
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request Activation"}
                </Button>
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[640px] w-[95vw] p-0 overflow-hidden bg-white shadow-2xl rounded-[32px] border-none gap-0 outline-none flex flex-col max-h-[90vh]">
                <AnimatePresence mode="wait">
                    {!success ? (
                        <motion.div
                            key="payment-content"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col overflow-y-auto custom-scrollbar"
                        >
                            {/* Header */}
                            <div className="w-full bg-slate-50/30 px-6 py-6 sm:px-10 border-b border-slate-100/50">
                                <DialogHeader className="space-y-0 flex flex-row items-center justify-between gap-6">
                                    <div className="flex-1 text-left">
                                        <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight mb-1">
                                            Unlock Premium Template
                                        </DialogTitle>
                                        <DialogDescription className="text-slate-500 font-bold text-xs sm:text-sm leading-relaxed max-w-[280px]">
                                            {templateTitle ? `Unlock "${templateTitle}" and all premium features.` : 'Complete your payment to access all premium templates.'}
                                        </DialogDescription>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0">
                                        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 mb-2">
                                            <Zap className="h-5 w-5 text-[#2196F3] fill-[#2196F3]/10" />
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block -mb-1">Total</span>
                                            <div className="text-2xl sm:text-3xl font-black text-[#2196F3] tracking-tighter">${amount}</div>
                                        </div>
                                    </div>
                                </DialogHeader>
                            </div>

                            {/* Region Selector */}
                            <div className="w-full px-6 pt-6 sm:px-10">
                                <div className="flex bg-slate-100 p-1 rounded-2xl">
                                    <button
                                        onClick={() => setRegion('pakistan')}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 h-10 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all",
                                            region === 'pakistan' ? "bg-white text-[#2196F3] shadow-sm" : "text-slate-500 hover:text-slate-700"
                                        )}
                                    >
                                        <Flag className="h-4 w-4 fill-emerald-100 text-emerald-600" />
                                        Pakistan
                                    </button>
                                    <button
                                        onClick={() => setRegion('international')}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 h-10 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all",
                                            region === 'international' ? "bg-white text-[#2196F3] shadow-sm" : "text-slate-500 hover:text-slate-700"
                                        )}
                                    >
                                        <Globe className="h-4 w-4 text-blue-500" />
                                        International
                                    </button>
                                </div>
                            </div>

                            {/* Payment Method Selection */}
                            <div className="w-full px-6 py-6 sm:px-10 space-y-6">
                                {/* Amount Input */}
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Choose Upgrade Amount (Min $5.00)</Label>
                                    <div className="relative group">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="5"
                                            className="h-14 text-xl bg-slate-50/50 border-2 border-slate-100 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 focus:border-[#2196F3] rounded-[20px] font-black pl-12 transition-all"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                        />
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-[#2196F3]" />
                                        {parseFloat(amount) < 5 && (
                                            <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 animate-pulse">Minimum amount is $5.00</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Select Payment Method</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {paymentMethods.map((method) => (
                                            <button
                                                key={method.id}
                                                type="button"
                                                onClick={() => setSelectedMethod(method.id)}
                                                className={cn(
                                                    "relative p-4 rounded-2xl border-2 transition-all text-left group",
                                                    selectedMethod === method.id
                                                        ? "border-[#2196F3] bg-[#2196F3]/5 shadow-md"
                                                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                                                )}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                                                        selectedMethod === method.id ? "bg-white shadow-sm" : "bg-slate-50"
                                                    )}>
                                                        <method.icon className={cn(
                                                            "h-5 w-5",
                                                            method.id === 'card' ? "text-slate-600" : `text-slate-400`
                                                        )} style={method.id !== 'card' ? { color: method.color.replace('[', '').replace(']', '') } : {}} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs font-black text-slate-900 mb-0.5 truncate">{method.name}</div>
                                                        <div className="text-[10px] font-bold text-slate-400">{method.desc}</div>
                                                    </div>
                                                </div>
                                                {selectedMethod === method.id && (
                                                    <motion.div
                                                        layoutId="selected-indicator"
                                                        className="absolute top-2 right-2 w-5 h-5 bg-[#2196F3] rounded-full flex items-center justify-center"
                                                        initial={false}
                                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                    >
                                                        <CheckCircle2 className="h-3 w-3 text-white" />
                                                    </motion.div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Dynamic Form Fields */}
                                <div className="pb-10">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={selectedMethod}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {renderFormFields()}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success-message"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-12 text-center space-y-6"
                        >
                            <div className="w-24 h-24 bg-green-100 rounded-[32px] flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl">
                                <CheckCircle2 className="w-12 h-12 text-green-600" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Success!</h2>
                                <p className="text-slate-500 font-bold text-lg leading-relaxed italic">
                                    {selectedMethod === 'card'
                                        ? "Your payment was processed successfully. Premium features are now active!"
                                        : "Your payment request has been sent for verification. We'll update you shortly!"}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
