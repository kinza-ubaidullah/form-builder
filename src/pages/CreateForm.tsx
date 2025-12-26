import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { formsApi } from '@/db/api';
import { useToast } from '@/hooks/use-toast';
import { UpgradeModal } from '@/components/payment/UpgradeModal';
import { Loader2 } from 'lucide-react';

export default function CreateForm() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const { toast } = useToast();
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [checkingLimit, setCheckingLimit] = useState(true);

    useEffect(() => {
        const createNewForm = async () => {
            if (!profile) return;

            try {
                // Check limit first
                const forms = await formsApi.getAll();
                if (forms.length >= 5) {
                    setCheckingLimit(false);
                    setUpgradeModalOpen(true);
                    return;
                }

                const newForm = await formsApi.create({
                    created_by: profile.id,
                    title: 'Untitled Form',
                    status: 'draft',
                    settings: {},
                    branding: {},
                });

                navigate(`/forms/${newForm.id}/edit`);
            } catch (error) {
                console.error('Failed to create form:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to create new form',
                    variant: 'destructive',
                });
                navigate('/dashboard');
            }
        };

        createNewForm();
    }, [profile, navigate, toast]);

    const handleModalClose = (open: boolean) => {
        setUpgradeModalOpen(open);
        if (!open) {
            navigate('/');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <UpgradeModal open={upgradeModalOpen} onOpenChange={handleModalClose} />
            {checkingLimit && (
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Creating your new form...</p>
                </div>
            )}
        </div>
    );
}
