interface PremiumLockProps {
    children: React.ReactNode;
    isPremium?: boolean;
    title?: string;
    description?: string;
}

export function PremiumLock({
    children,
}: PremiumLockProps) {
    return <>{children}</>;
}
