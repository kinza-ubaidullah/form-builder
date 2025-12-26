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
import { CheckCircle2, Zap, Landmark, Loader2, User, Mail, Phone, DollarSign, CreditCard } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { profilesApi } from "@/db/api";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface UpgradeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type PaymentMethod = 'card' | 'hbl' | 'payoneer' | 'sadapay' | 'easypaisa' | 'jazzcash';

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
    const { profile, refreshProfile } = useAuth();
    const { toast } = useToast();
    const [requesting, setRequesting] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('hbl');

    const amount = '20.00'; // Fixed subscription amount
    const [senderName, setSenderName] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [payoneerEmail, setPayoneerEmail] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [accountNumber, setAccountNumber] = useState('');

    const paymentMethods = [
        { id: 'card' as PaymentMethod, name: 'Credit Card', icon: CreditCard, color: 'slate' },
        { id: 'hbl' as PaymentMethod, name: 'HBL Bank', icon: Landmark, color: '[#1c2c54]' },
        { id: 'payoneer' as PaymentMethod, name: 'Payoneer', icon: Mail, color: '[#ff4800]' },
        { id: 'sadapay' as PaymentMethod, name: 'SadaPay', icon: Phone, color: '[#FF4D4D]' },
        { id: 'easypaisa' as PaymentMethod, name: 'EasyPaisa', icon: Phone, color: '[#00A950]' },
        { id: 'jazzcash' as PaymentMethod, name: 'JazzCash', icon: Phone, color: '[#FFB800]' },
    ];

    const handleRequestActivation = async () => {
        if (!profile) return;
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

    const renderFormFields = () => {
        switch (selectedMethod) {
            case 'card':
                return (
                    <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 text-center">
                        <p className="text-sm font-bold text-amber-800">
                            Card payments are available in the template unlock modal.
                        </p>
                    </div>
                );

            case 'hbl':
                return (
                    <div className="space-y-4">
                        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 text-center">Transfer to this account</div>
                            <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                                    <Landmark className="h-5 w-5 text-[#1c2c54]" />
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
                                    className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold"
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
                                    className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount</Label>
                                <div className="relative">
                                    <Input
                                        placeholder="20.00"
                                        required
                                        type="number"
                                        step="0.01"
                                        className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold pl-8"
                                        value={amount}
                                        readOnly
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
                                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
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
                            <div className="relative">
                                <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    required
                                    className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold"
                                    value={payoneerEmail}
                                    onChange={(e) => setPayoneerEmail(e.target.value)}
                                />
                                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Transaction ID</Label>
                                <Input
                                    placeholder="Receipt ID"
                                    required
                                    className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount</Label>
                                <div className="relative">
                                    <Input
                                        placeholder="20.00"
                                        required
                                        type="number"
                                        step="0.01"
                                        className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold pl-8"
                                        value={amount}
                                        readOnly
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
                                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
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
                            <Input
                                placeholder="sadapay.me/yourname"
                                required
                                className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sender Name</Label>
                            <div className="relative">
                                <Input
                                    placeholder="Your Full Name"
                                    required
                                    className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold"
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
                                    required
                                    className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount</Label>
                                <div className="relative">
                                    <Input
                                        placeholder="20.00"
                                        required
                                        type="number"
                                        step="0.01"
                                        className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold pl-8"
                                        value={amount}
                                        readOnly
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
                                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
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
                            <div className="relative">
                                <Input
                                    placeholder="+92 300 1234567"
                                    required
                                    className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                />
                                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sender Name</Label>
                            <div className="relative">
                                <Input
                                    placeholder="Your Full Name"
                                    required
                                    className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold"
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
                                    required
                                    className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount</Label>
                                <div className="relative">
                                    <Input
                                        placeholder="20.00"
                                        required
                                        type="number"
                                        step="0.01"
                                        className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-[#2196F3]/5 rounded-xl font-bold pl-8"
                                        value={amount}
                                        readOnly
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
                            $20/month - Unlock unlimited forms and advanced features for 30 days.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Benefits */}
                    <div className="grid grid-cols-2 gap-3">
                        {["Unlimited Forms", "Full Analytics", "Priority Support", "Custom Logo"].map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                                <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">{benefit}</span>
                            </div>
                        ))}
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

                    <Button
                        className="w-full gap-2 bg-[#2196F3] hover:bg-[#1e88e5] text-white font-black rounded-2xl shadow-xl shadow-[#2196F3]/20 h-12"
                        onClick={handleRequestActivation}
                        disabled={requesting || !transactionId || selectedMethod === 'card'}
                    >
                        {requesting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Zap className="h-4 w-4 fill-white" />
                        )}
                        {selectedMethod === 'card' ? 'Use template unlock for cards' : transactionId ? 'Request Activation' : 'Enter Transaction ID'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
