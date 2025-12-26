import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, Zap } from "lucide-react";
import { useState } from "react";
import { UpgradeModal } from "@/components/payment/UpgradeModal";

interface PremiumLockProps {
    children: React.ReactNode;
    isPremium?: boolean;
    title?: string;
    description?: string;
}

export function PremiumLock({
    children,
    isPremium = false,
    title = "Premium Feature",
    description = "Upgrade to unlock this advanced feature."
}: PremiumLockProps) {
    const [open, setOpen] = useState(false);

    if (isPremium) {
        return <>{children}</>;
    }

    return (
        <div className="relative">
            <UpgradeModal open={open} onOpenChange={setOpen} />
            <div className="filter blur-sm pointer-events-none select-none opacity-50">
                {children}
            </div>
            <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-6 text-center shadow-lg border-primary/20 bg-background/95 backdrop-blur-sm">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{title}</h3>
                    <p className="text-muted-foreground mb-6">{description}</p>
                    <Button onClick={() => setOpen(true)} className="w-full gap-2">
                        <Zap className="h-4 w-4" />
                        Unlock Premium
                    </Button>
                </Card>
            </div>
        </div>
    );
}
