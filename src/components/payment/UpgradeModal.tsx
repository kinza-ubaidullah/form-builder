import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Zap, Landmark, Loader2, User, Mail, Phone, DollarSign, CreditCard, Globe, Flag, Clock } from "lucide-react";
import { useState, useEffect } from "react";
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

interface UpgradeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type PaymentMethod = 'card' | 'hbl' | 'payoneer' | 'sadapay' | 'easypaisa' | 'jazzcash' | 'payfast' | 'paddle';
type PaymentRegion = 'pakistan' | 'international';

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
    const { profile, refreshProfile } = useAuth();
    const { toast } = useToast();
    const [requesting, setRequesting] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
    const [region, setRegion] = useState<PaymentRegion>('pakistan');
    const [amount, setAmount] = useState('5.00');
    const [senderName, setSenderName] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [payoneerEmail, setPayoneerEmail] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loadingStripe, setLoadingStripe] = useState(false);
    const [payfastData, setPayfastData] = useState<any>(null);
    const [paddle, setPaddle] = useState<Paddle>();

    const daysRemaining = profile?.subscription_end_date
        ? Math.ceil((new Date(profile.subscription_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    const isEarlyRenewal = daysRemaining > 0;

    useEffect(() => {
        initializePaddle({
            environment: 'sandbox',
            token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN || 'test_token'
        }).then((paddleInstance) => {
            if (paddleInstance) setPaddle(paddleInstance);
        });
    }, []);

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
                    metadata: { userId: profile?.id, type: 'subscription_upgrade' }
                },
            });

            if (error) throw error;
            setClientSecret(data.clientSecret);
        } catch (error) {
            console.error("Stripe initialization failed:", error);
            toast({
                title: "Error",
                description: "Failed to initialize card payment. Please try again.",
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
                payment_details: { stripe: true },
                subscription_status: 'active',
                subscription_start_date: new Date().toISOString(),
                subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            });

            await refreshProfile();
            toast({
                title: "Payment Successful!",
                description: "Your account has been upgraded to Premium.",
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to update profile after payment:", error);
        }
    };

    const paymentMethods = region === 'pakistan' ? [
        { id: 'payfast' as PaymentMethod, name: 'PayFast', icon: Zap, color: '[#2196F3]', desc: 'Cards / Wallets' },
        { id: 'card' as PaymentMethod, name: 'Stripe', icon: CreditCard, color: 'slate', desc: 'International Cards' },
        { id: 'easypaisa' as PaymentMethod, name: 'EasyPaisa', icon: Phone, color: '[#00A950]', desc: 'Mobile Wallet' },
        { id: 'jazzcash' as PaymentMethod, name: 'JazzCash', icon: Phone, color: '[#FFB800]', desc: 'Mobile Wallet' },
        { id: 'hbl' as PaymentMethod, name: 'HBL Bank', icon: Landmark, color: '[#1c2c54]', desc: 'Bank Transfer' },
        { id: 'sadapay' as PaymentMethod, name: 'SadaPay', icon: Phone, color: '[#FF4D4D]', desc: 'Mobile Wallet' },
    ] : [
        { id: 'paddle' as PaymentMethod, name: 'Paddle Checkout', icon: Globe, color: 'slate', desc: 'Secure International' },
        { id: 'card' as PaymentMethod, name: 'Stripe', icon: CreditCard, color: 'slate', desc: 'Direct Cards' },
        { id: 'payoneer' as PaymentMethod, name: 'Payoneer', icon: Mail, color: '[#ff4800]', desc: 'Manual Transfer' },
    ];

    const handleRequestActivation = async () => {
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
            setRequesting(true);

            const paymentDetails: Record<string, any> = { senderName };

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
            toast({
                title: "Request Sent",
                description: "Your upgrade request has been sent for verification.",
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to request upgrade:", error);
            toast({
                title: "Error",
                description: "Failed to send request. Please try again.",
                variant: "destructive",
            });
        } finally {
            setRequesting(false);
        }
    };

    const initiatePayFast = async () => {
        try {
            setRequesting(true);
            const { data, error } = await supabase.functions.invoke('initiate-payfast', {
                body: {
                    amount: parseFloat(amount),
                    orderId: `SUB-${Date.now()}`,
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
            setRequesting(false);
        }
    };

    const handlePaddleCheckout = () => {
        if (!paddle || !profile) return;
        paddle.Checkout.open({
            items: [{ priceId: 'pri_01gsz97hr622gnymm92s9rtjkj', quantity: 1 }],
            customer: { email: profile.email || '' },
            customData: { user_id: profile.id, plan: 'premium', early_bonus: isEarlyRenewal }
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
                            disabled={requesting}
                        >
                            {requesting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Initiate PayFast Payment"}
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
                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                            <methodDetails.icon className="h-5 w-5" style={{ color: methodDetails.color }} />
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
                    <div className="relative">
                        <Input
                            placeholder="Your Full Name"
                            className="h-11 bg-slate-50/50 border-slate-200 rounded-xl font-bold"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                        />
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Transaction ID</Label>
                        <Input
                            placeholder="Receipt ID"
                            className="h-11 bg-slate-50/50 border-slate-200 rounded-xl font-bold"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                step="0.01"
                                min="5"
                                className="h-11 bg-slate-50/50 border-slate-200 rounded-xl font-bold pl-8"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        </div>
                    </div>
                </div>

                <Button
                    className="w-full gap-2 bg-[#2196F3] hover:bg-[#1e88e5] text-white font-black rounded-2xl shadow-xl shadow-[#2196F3]/20 h-12"
                    onClick={handleRequestActivation}
                    disabled={requesting || !transactionId || !senderName}
                >
                    {requesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 fill-white" />}
                    Request Activation
                </Button>
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[580px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-[32px] outline-none max-h-[90vh] flex flex-col">
                <div className="bg-slate-50/50 p-6 sm:p-8 border-b border-slate-100">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 rounded-2xl bg-[#2196F3]/10 flex items-center justify-center mb-4">
                            <Zap className="h-6 w-6 text-[#2196F3] fill-[#2196F3]/10" />
                        </div>
                        <DialogTitle className="text-2xl text-center font-black tracking-tight text-slate-900">
                            Upgrade to Premium
                        </DialogTitle>
                        <DialogDescription className="text-center font-bold text-slate-500 pt-1">
                            Unlock unlimited forms and advanced features. Starting from $5.00.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Subscription Status Badge */}
                    {profile?.subscription_status === 'active' && (
                        <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-slate-400">Current Plan</h4>
                                    <p className="text-xs font-black text-slate-900 tracking-tight">Premium Active</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h4 className="text-[10px] font-black uppercase text-slate-400">Time Left</h4>
                                <p className={cn(
                                    "text-xs font-black tracking-tight",
                                    daysRemaining < 5 ? "text-amber-600" : "text-emerald-600"
                                )}>
                                    {daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Region Selector */}
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

                    {/* Early Renewal Bonus */}
                    {isEarlyRenewal && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4"
                        >
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <Zap className="h-5 w-5 text-amber-600 fill-amber-600/20" />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-black uppercase text-amber-800">Early Renewal Bonus!</h4>
                                <p className="text-[10px] font-bold text-amber-700/80 leading-tight">Renew now to get <span className="text-amber-900">+5 FREE forms</span> added to your account instantly.</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Benefits */}
                    <div className="grid grid-cols-2 gap-3">
                        {["Unlimited Forms", "Full Analytics", "Priority Support", "Custom Logo"].map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                                <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">{benefit}</span>
                            </div>
                        ))}
                    </div>

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

                    {/* Payment Method Selection */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Select Payment Method</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {paymentMethods.map((method) => (
                                <button
                                    key={method.id}
                                    type="button"
                                    onClick={() => setSelectedMethod(method.id)}
                                    className={cn(
                                        "relative p-3 rounded-xl border-2 transition-all",
                                        selectedMethod === method.id
                                            ? "border-[#2196F3] bg-[#2196F3]/5"
                                            : "border-slate-200 bg-white hover:border-slate-300"
                                    )}
                                >
                                    <div className="flex flex-col items-center gap-2 text-center">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center",
                                            selectedMethod === method.id ? "bg-white" : "bg-slate-50"
                                        )}>
                                            <method.icon className="h-4 w-4" style={method.id !== 'card' ? { color: method.color.replace('[', '').replace(']', '') } : {}} />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-900">{method.name}</span>
                                    </div>
                                    {selectedMethod === method.id && (
                                        <div className="absolute top-1 right-1 w-4 h-4 bg-[#2196F3] rounded-full flex items-center justify-center">
                                            <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dynamic Form */}
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
            </DialogContent>
        </Dialog>
    );
}
