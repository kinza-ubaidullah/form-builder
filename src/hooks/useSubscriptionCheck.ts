import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { profilesApi } from '@/db/api';
import { useToast } from './use-toast';

/**
 * Hook to check subscription expiry and automatically revoke premium status
 * Runs on mount and checks if subscription has expired
 */
export function useSubscriptionCheck() {
    const { profile, refreshProfile } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        const checkSubscription = async () => {
            if (!profile || !profile.is_premium || !profile.subscription_end_date) {
                return;
            }

            const now = new Date();
            const endDate = new Date(profile.subscription_end_date);
            const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            // If subscription has expired
            if (now > endDate && profile.subscription_status === 'active') {
                try {
                    await profilesApi.updateStatus(profile.id, {
                        is_premium: false,
                        subscription_status: 'expired',
                    });

                    await refreshProfile();

                    toast({
                        title: 'Subscription Expired',
                        description: 'Your premium subscription has expired. Please renew to continue using premium features.',
                        variant: 'destructive',
                    });
                } catch (error) {
                    console.error('Failed to update subscription status:', error);
                }
            }
            // Show reminder if expiring soon (7 days or less)
            else if (daysLeft <= 7 && daysLeft > 0 && profile.subscription_status === 'active') {
                toast({
                    title: 'Subscription Expiring Soon',
                    description: `Your premium subscription expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Renew now to avoid interruption.`,
                });
            }
        };

        checkSubscription();

        // Check every hour
        const interval = setInterval(checkSubscription, 60 * 60 * 1000);

        return () => clearInterval(interval);
    }, [profile, refreshProfile, toast]);
}
