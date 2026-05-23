import { completeUserOnboarding, getCurrentUser } from '@/api-client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { setCookie } from '@/lib/helpers';
import { getApiErrorMessage } from '@/lib/utils';
import { Loader2, UserCircle } from 'lucide-react';
import { useState } from 'react';

interface ProfileCompletionModalProps {
  open: boolean;
}

const ProfileCompletionModal = ({ open }: ProfileCompletionModalProps) => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; phone?: string } = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    else if (name.trim().length < 2)
      newErrors.name = 'Name must be at least 2 characters';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(phone.trim()))
      newErrors.phone = 'Number must be 10 digits and start with 6, 7, 8 or 9';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await completeUserOnboarding({
        fullName: name.trim(),
        phone: phone.trim(),
      });

      const { data } = await getCurrentUser();
      setUser(data);
      setCookie('auth-user', JSON.stringify(data));

      toast({
        title: 'Profile saved!',
        description: 'Your details have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: getApiErrorMessage(error),
        description: '',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md [&>button:last-of-type]:hidden [&>button[data-radix-collection-item]]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <UserCircle className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-xl">Complete Your Profile</DialogTitle>
          <DialogDescription className="text-base">
            We need a few details to get you started on Samvidhan Legal
            Advisory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Full Name</Label>
            <Input
              id="profile-name"
              placeholder="e.g. Rajesh Kumar"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((p) => ({ ...p, name: undefined }));
              }}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-phone">Phone Number</Label>
            <div className="flex rounded-md ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                +91
              </span>
              <Input
                id="profile-phone"
                className="rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="9876543210"
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ''));
                  setErrors((p) => ({ ...p, phone: undefined }));
                }}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Saving...' : 'Continue'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileCompletionModal;
