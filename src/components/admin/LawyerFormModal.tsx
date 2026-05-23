import { addLawyer, updateAdminLawyer } from '@/api-client';
import WithShimmer from '@/components/WithShimmer';
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
import { Textarea } from '@/components/ui/textarea';
import { useCategories } from '@/hooks/useCategories';
import { useFormErrors } from '@/hooks/useFormErrors';
import { queryClient } from '@/lib/query-client';
import { getApiErrorMessage, validateEmail, validatePhone } from '@/lib/utils';
import type { FieldErrors, LawyerFormModalProps } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '../ui/use-toast';

export const LawyerFormModal = ({ open, onClose, lawyer, onSave }: LawyerFormModalProps) => {
  const isEditMode = !!lawyer;
  const { toast } = useToast();
  const { errors, setErrors, clearError, hasErrors, resetErrors } = useFormErrors();

  // --- Form state ---

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [barCouncilId, setBarCouncilId] = useState('');
  const [degree, setDegree] = useState('');
  const [careerStartDate, setCareerStartDate] = useState('');
  const [bio, setBio] = useState('');
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);

  // --- Data ---

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  // --- Form reset / populate ---

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setBarCouncilId('');
    setDegree('');
    setCareerStartDate('');
    setBio('');
    setSelectedSpecializations([]);
    resetErrors();
  };

  const populateFromLawyer = (data: NonNullable<typeof lawyer>) => {
    setName(data.user?.fullName ?? '');
    setEmail(data.user?.email ?? '');
    setPhone(data.user?.phone ?? '');

    setBarCouncilId(data.barCouncilId ?? '');
    setDegree(data.degree ?? '');
    setBio(data.bio ?? '');
    setCareerStartDate(
      data.careerStartDate ? new Date(data.careerStartDate).toISOString().split('T')[0] : ''
    );

    const practiceAreaIds = data.lawyerPracticeAreas
      ?.map((s) => s.practiceArea?.id)
      .filter(Boolean) as string[];
    setSelectedSpecializations(practiceAreaIds ?? []);

    resetErrors();
  };

  useEffect(() => {
    if (!open) return;
    lawyer ? populateFromLawyer(lawyer) : resetForm();
  }, [lawyer, open]);

  // --- Mutations ---

  const { mutateAsync: createLawyer, isPending: isCreating } = useMutation({
    mutationFn: addLawyer,
  });

  const { mutateAsync: editLawyer, isPending: isUpdating } = useMutation({
    mutationFn: (body: Record<string, unknown>) => updateAdminLawyer(lawyer!.id, body),
  });

  const isPending = isCreating || isUpdating;

  // --- Validation ---

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!name.trim()) newErrors.name = 'Full name is required';

    if (!isEditMode) {
      const emailError = validateEmail(email);
      if (emailError) newErrors.email = emailError;
    }

    if (phone.trim()) {
      const phoneError = validatePhone(phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    if (hasErrors(newErrors)) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  // --- Payload builders ---

  const buildSharedFields = () => ({
    barCouncilId: barCouncilId.trim(),
    degree: degree.trim(),
    bio: bio.trim(),
    lawyerPracticeAreas: selectedSpecializations,
  });

  const buildEditPayload = () => ({
    userProfile: { fullName: name.trim(), phone: phone.trim() },
    ...buildSharedFields(),
    careerStartDate: careerStartDate || null,
  });

  const buildCreatePayload = () => ({
    fullName: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    ...buildSharedFields(),
    careerStartDate: careerStartDate ? new Date(careerStartDate) : null,
  });

  // --- Submit ---

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const response = isEditMode
        ? await editLawyer(buildEditPayload())
        : await createLawyer(buildCreatePayload());

      await queryClient.invalidateQueries({ queryKey: ['admin-lawyers'] });
      onSave({ name, email, phone, barCouncilId, degree, bio }, response?.data?.message);
      resetForm();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: getApiErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  // --- Helpers ---

  const toggleSpec = (id: string) => {
    setSelectedSpecializations((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // --- Render ---

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[min(90dvh,calc(100dvh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-h-[85vh] sm:gap-4 sm:overflow-y-auto sm:p-6 sm:max-w-lg">
        <DialogHeader className="shrink-0 space-y-0 border-b px-4 pb-3 pt-5 text-left sm:border-0 sm:px-0 sm:pb-0 sm:pt-0">
          <DialogTitle className="pr-8 text-base leading-snug sm:pr-0 sm:text-lg">
            {isEditMode ? 'Edit Lawyer' : 'Add Lawyer'}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-3 sm:max-h-none sm:flex-none sm:overflow-visible sm:px-0 sm:py-0">
          <div className="space-y-3 sm:space-y-4">
            {/* Name & Email */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError('name');
                  }}
                  placeholder="Adv. Name"
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError('email');
                  }}
                  placeholder="lawyer@example.com"
                  disabled={isEditMode}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
            </div>

            {/* Phone & Bar Council ID */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <div className="flex rounded-md ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                    +91
                  </span>
                  <Input
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
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Bar Council ID</Label>
                <Input
                  value={barCouncilId}
                  onChange={(e) => setBarCouncilId(e.target.value)}
                  placeholder="BCI/XX/XXXX/XXXX"
                  disabled={isEditMode}
                />
              </div>
            </div>

            {/* Degree & Career Start Date */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Degree</Label>
                <Input
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="LL.B, LL.M"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Career Start Date</Label>
                <Input
                  type="date"
                  value={careerStartDate}
                  onChange={(e) => setCareerStartDate(e.target.value)}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Label>Bio</Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Short bio about the lawyer..."
                rows={3}
                className="min-h-[5.5rem] sm:min-h-0"
              />
            </div>

            {/* Specializations */}
            <div className="space-y-1.5">
              <Label>Specializations</Label>
              <div className="max-h-32 overflow-y-auto overscroll-y-contain rounded-md border border-border/60 bg-muted/20 p-2 sm:max-h-40 sm:border-0 sm:bg-transparent sm:p-0">
                <div className="flex flex-wrap gap-1.5">
                  {categoriesLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <WithShimmer key={i} loading className="h-7 w-20 rounded-full" />
                      ))
                    : categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleSpec(cat.id)}
                          className={`rounded-full border px-2.5 py-1 text-left text-xs leading-snug transition-colors ${
                            selectedSpecializations.includes(cat.id)
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-muted text-muted-foreground hover:bg-accent'
                          }`}
                        >
                          <span className="line-clamp-2">{cat.name}</span>
                        </button>
                      ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t bg-background px-4 py-3 pb-[max(0.75rem,calc(0.5rem+env(safe-area-inset-bottom,0px)))] sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:pb-0">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending} className="w-full sm:w-auto">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Save Changes' : 'Add Lawyer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
