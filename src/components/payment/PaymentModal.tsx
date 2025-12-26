import { useState } from 'react';
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
import { CreditCard, Loader2, CheckCircle2, ShieldCheck, Zap, Landmark, User, Mail, Phone, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { profilesApi } from "@/db/api";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    templateTitle?: string;
}

type PaymentMethod = 'card' | 'hbl' | 'payoneer' | 'sadapay' | 'easypaisa' | 'jazzcash';

export function PaymentModal({ open, onOpenChange, templateTitle }: PaymentModalProps) {
    const { profile, refreshProfile } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');

    // Form states for different methods
    const [amount, setAmount] = useState('6.00');
    const [senderName, setSenderName] = useState('');
    const [transactionId, setTransactionId] = useState('');

    // Method-specific states
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    const [payoneerEmail, setPayoneerEmail] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [accountNumber, setAccountNumber] = useState('');

    const paymentMethods = [
        { id: 'card' as PaymentMethod, name: 'Debit / Credit Card', icon: CreditCard, color: 'slate', desc: 'Instant activation' },
        { id: 'hbl' as PaymentMethod, name: 'Habib Bank (HBL)', icon: Landmark, color: '[#1c2c54]', desc: 'Bank transfer' },
        { id: 'payoneer' as PaymentMethod, name: 'Payoneer', icon: Mail, color: '[#ff4800]', desc: 'International' },
        { id: 'sadapay' as PaymentMethod, name: 'SadaPay', icon: Phone, color: '[#FF4D4D]', desc: 'Mobile wallet' },
        { id: 'easypaisa' as PaymentMethod, name: 'EasyPaisa', icon: Phone, color: '[#00A950]', desc: 'Mobile wallet' },
        { id: 'jazzcash' as PaymentMethod, name: 'JazzCash', icon: Phone, color: '[#FFB800]', desc: 'Mobile wallet' },
    ];

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        try {
            setLoading(true);

            if (selectedMethod === 'card') {
                // Simulate card processing
                await new Promise(resolve => setTimeout(resolve, 2000));
                await profilesApi.updateStatus(profile.id, {
                    is_premium: true,
                    payment_method: 'card',
                    amount: parseFloat(amount),
                    payment_details: {
                        cardName,
                        lastFour: cardNumber.slice(-4)
                    }
                });
            } else {
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
            }

            await refreshProfile();
            setSuccess(true);

            toast({
                title: selectedMethod === 'card' ? "Payment Successful!" : "Request Sent",
                description: selectedMethod === 'card'
                    ? `You have successfully unlocked Premium for $${amount}.`
                    : "Your payment confirmation has been sent for verification.",
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

    const renderFormFields = () => {
        switch (selectedMethod) {
            case 'card':
                return (
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cardholder Name</Label>
                            <Input
                                placeholder="e.g. John Doe"
                                required
                                className="h-11 bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Card Number</Label>
                            <div className="relative group">
                                <Input
                                    placeholder="0000 0000 0000 0000"
                                    required
                                    className="h-11 bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold pr-12"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                />
                                <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-[#2196F3] transition-colors" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Expiry Date</Label>
                                <Input
                                    placeholder="MM/YY"
                                    required
                                    className="h-11 bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold"
                                    value={expiry}
                                    onChange={(e) => setExpiry(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">CVV</Label>
                                <Input
                                    placeholder="***"
                                    required
                                    type="password"
                                    maxLength={3}
                                    className="h-11 bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold"
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'hbl':
                return (
                    <div className="space-y-4">
                        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 text-center">Transfer to this account</div>
                            <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                                    <Landmark className="h-6 w-6 text-[#1c2c54]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-black text-[#1c2c54] uppercase">Habib Bank Limited</div>
                                    <div className="text-sm font-bold text-slate-900">FormBuilder Solutions</div>
                                    <div className="text-xs font-mono font-black text-slate-400">1234 5678 9012 3456</div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sender Name</Label>
                            <div className="relative group">
                                <Input
                                    placeholder="Your Account Name"
                                    required
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
                                    required
                                    className="h-11 bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount</Label>
                                <div className="relative group">
                                    <Input
                                        placeholder="6.00"
                                        required
                                        type="number"
                                        step="0.01"
                                        className="h-11 bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold pl-8"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'payoneer':
                return (
                    <div className="space-y-4">
                        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 text-center">Transfer to this account</div>
                            <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                                    <span className="font-black text-xs text-[#ff4800]">P</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-black text-[#ff4800] uppercase">Payoneer</div>
                                    <div className="text-sm font-bold text-slate-900">pay@formbuilder.com</div>
                                    <div className="text-xs font-mono font-black text-slate-400">Merchant Account</div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Payoneer Email</Label>
                            <div className="relative group">
                                <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    required
                                    className="h-11 bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold"
                                    value={payoneerEmail}
                                    onChange={(e) => setPayoneerEmail(e.target.value)}
                                />
                                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#2196F3] transition-colors" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Transaction ID</Label>
                                <Input
                                    placeholder="Receipt ID"
                                    required
                                    className="h-11 bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount</Label>
                                <div className="relative group">
                                    <Input
                                        placeholder="6.00"
                                        required
                                        type="number"
                                        step="0.01"
                                        className="h-11 bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold pl-8"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'sadapay':
                return (
                    <div className="space-y-4">
                        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 text-center">Transfer to this account</div>
                            <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                                    <span className="font-black text-xs text-[#FF4D4D]">SD</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-black text-[#FF4D4D] uppercase">SadaPay</div>
                                    <div className="text-sm font-bold text-slate-900">sadapay.me/formbuilder</div>
                                    <div className="text-xs font-mono font-black text-slate-400">+92 300 1122334</div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your SadaPay Account</Label>
                            <div className="relative group">
                                <Input
                                    placeholder="sadapay.me/yourname"
                                    required
                                    className="h-11 bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sender Name</Label>
                            <div className="relative group">
                                <Input
                                    placeholder="Your Full Name"
                                    required
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
                                    required
                                    className="h-11 bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount</Label>
                                <div className="relative group">
                                    <Input
                                        placeholder="6.00"
                                        required
                                        type="number"
                                        step="0.01"
                                        className="h-11 bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold pl-8"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'easypaisa':
            case 'jazzcash':
                const isEasypaisa = selectedMethod === 'easypaisa';
                const brandColor = isEasypaisa ? '#00A950' : '#FFB800';
                const brandName = isEasypaisa ? 'EasyPaisa' : 'JazzCash';
                const brandInitials = isEasypaisa ? 'EP' : 'JC';
                const brandNumber = isEasypaisa ? '+92 345 1122334' : '+92 301 1122334';

                return (
                    <div className="space-y-4">
                        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 text-center">Transfer to this account</div>
                            <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                                    <span className="font-black text-xs" style={{ color: brandColor }}>{brandInitials}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-black uppercase" style={{ color: brandColor }}>{brandName}</div>
                                    <div className="text-sm font-bold text-slate-900">FormBuilder Solutions</div>
                                    <div className="text-xs font-mono font-black text-slate-400">{brandNumber}</div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Registered Mobile</Label>
                            <div className="relative group">
                                <Input
                                    placeholder="+92 300 1234567"
                                    required
                                    className="h-11 bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                />
                                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#2196F3] transition-colors" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sender Name</Label>
                            <div className="relative group">
                                <Input
                                    placeholder="Your Full Name"
                                    required
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
                                    required
                                    className="h-11 bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount</Label>
                                <div className="relative group">
                                    <Input
                                        placeholder="6.00"
                                        required
                                        type="number"
                                        step="0.01"
                                        className="h-11 bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold pl-8"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
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

                            {/* Payment Method Selection */}
                            <div className="w-full px-6 py-6 sm:px-10 space-y-6">
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
                                                            method.id === 'card' ? "text-slate-600" : `text-${method.color}`
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
                                <form onSubmit={handlePayment} className="space-y-6">
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

                                    {selectedMethod === 'card' && (
                                        <div className="flex items-center justify-center gap-2 py-3 bg-green-50/30 rounded-xl border border-green-100/50">
                                            <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                                            <span className="text-[9px] font-black text-green-700/60 uppercase tracking-widest">Secure SSL Encrypted</span>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full h-12 rounded-xl text-base font-black bg-[#2196F3] hover:bg-[#1e88e5] text-white shadow-lg shadow-[#2196F3]/20 transition-all active:scale-[0.99]"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Processing...
                                            </div>
                                        ) : selectedMethod === 'card' ? (
                                            `Confirm Payment • $${amount}`
                                        ) : (
                                            "Request Activation"
                                        )}
                                    </Button>
                                </form>
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
