import { createAdminUser, updateAdminUser } from '@/api-client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormErrors } from '@/hooks/useFormErrors';
import { queryClient } from '@/lib/query-client';
import { validateEmail, validatePhone } from '@/lib/utils';
import type { FieldErrors, UserFormModalProps } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export const UserFormModal = ({
  open,
  onClose,
  user,
  onSave,
}: UserFormModalProps) => {
  const isEditMode = !!user;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { errors, setErrors, clearError, hasErrors, resetErrors } =
    useFormErrors();

  // --- Form reset / populate ---

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    resetErrors();
  };

  useEffect(() => {
    if (!open) return;
    if (user) {
      setName(user.fullName ?? user.name ?? '');
      setEmail(user.email ?? '');
      setPhone(user.phone ?? '');
      setPassword('');
      resetErrors();
    } else {
      resetForm();
    }
  }, [open, user]);

  // --- Mutations ---

  const { mutateAsync: createUser, isPending: isCreating } = useMutation({
    mutationFn: (body: {
      fullName: string;
      email: string;
      phone: string;
      password?: string;
    }) => createAdminUser(body),
  });

  const { mutateAsync: editUser, isPending: isUpdating } = useMutation({
    mutationFn: (body: { fullName: string; phone: string }) =>
      updateAdminUser(user!.id, body),
  });

  const isPending = isCreating || isUpdating;

  // --- Validation ---

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    if (phone.trim()) {
      const phoneError = validatePhone(phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    if (!isEditMode && !password.trim())
      newErrors.password = 'Password is required';

    if (hasErrors(newErrors)) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  // --- Submit ---

  const handleSave = async () => {
    if (!validate()) return;

    const trimmed = {
      fullName: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    };

    const response = isEditMode
      ? await editUser({ fullName: trimmed.fullName, phone: trimmed.phone })
      : await createUser({ ...trimmed, password: password.trim() });

    await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    onSave(trimmed, response?.data?.message);
    resetForm();
  };

  // --- Render ---

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit User' : 'Add User'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label>
              Email <span className="text-xs text-muted-foreground">*</span>
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError('email');
              }}
              placeholder="Enter email"
              required
              disabled={isEditMode}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Password (create mode only) */}
          {!isEditMode && (
            <div className="space-y-1.5">
              <Label>
                Password{' '}
                <span className="text-xs text-muted-foreground">*</span>
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError('password');
                }}
                placeholder="Enter password"
                required
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>
          )}

          {/* Phone */}
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
                  clearError('phone');
                }}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4" />}
            {isEditMode ? 'Save Changes' : 'Add User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
