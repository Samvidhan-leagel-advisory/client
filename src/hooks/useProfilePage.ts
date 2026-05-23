import {
  getCurrentUser,
  updateLawyerProfile,
  updateUserProfile,
  uploadAsset,
} from '@/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type {
  CurrentUserApi,
  LawyerProfileApiShape,
  ProfileFormState,
} from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

const CURRENT_USER_KEY = ['currentUser'] as const;

function isoDateInput(iso: string | null | undefined): string {
  return iso?.split('T')[0] ?? '';
}

function specializationIds(
  lp: LawyerProfileApiShape | null | undefined
): string[] {
  return lp?.lawyerPracticeAreas?.map((a) => a.practiceAreaId) ?? [];
}

function sameSortedStringLists(a: string[], b: string[]): boolean {
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.length === sb.length && sa.every((v, i) => v === sb[i]);
}

function emptyForm(): ProfileFormState {
  return {
    fullName: '',
    phone: '',
    avatarUrl: null,
    gender: '',
    dob: '',
    degree: '',
    barCouncilId: '',
    careerStartDate: '',
    bio: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    selectedSpecializations: [],
  };
}

function formFromCurrentUser(cu: CurrentUserApi): ProfileFormState {
  const lp = cu.lawyerProfile;
  return {
    fullName: cu.fullName || '',
    phone: cu.phone || '',
    avatarUrl: cu.avatarUrl ?? null,
    gender: lp?.gender || '',
    dob: isoDateInput(lp?.dob ?? undefined),
    degree: lp?.degree || '',
    barCouncilId: lp?.barCouncilId || '',
    careerStartDate: isoDateInput(lp?.careerStartDate ?? undefined),
    bio: lp?.bio || '',
    addressLine1: lp?.addressLine1 || '',
    addressLine2: lp?.addressLine2 || '',
    city: lp?.city || '',
    state: lp?.state || '',
    pincode: lp?.pincode || '',
    selectedSpecializations: specializationIds(lp),
  };
}

function basicFieldsDirty(form: ProfileFormState, cu: CurrentUserApi): boolean {
  return (
    form.fullName !== (cu.fullName || '') ||
    form.phone !== (cu.phone || '') ||
    form.avatarUrl !== (cu.avatarUrl ?? null)
  );
}

function lawyerFieldsDirty(
  form: ProfileFormState,
  lp: LawyerProfileApiShape | null | undefined
): boolean {
  return (
    form.degree !== (lp?.degree || '') ||
    form.barCouncilId !== (lp?.barCouncilId || '') ||
    form.careerStartDate !== isoDateInput(lp?.careerStartDate ?? undefined) ||
    form.gender !== (lp?.gender || '') ||
    form.dob !== isoDateInput(lp?.dob ?? undefined) ||
    form.bio !== (lp?.bio || '') ||
    form.addressLine1 !== (lp?.addressLine1 || '') ||
    form.addressLine2 !== (lp?.addressLine2 || '') ||
    form.city !== (lp?.city || '') ||
    form.state !== (lp?.state || '') ||
    form.pincode !== (lp?.pincode || '') ||
    !sameSortedStringLists(form.selectedSpecializations, specializationIds(lp))
  );
}

function formIsDirty(
  form: ProfileFormState,
  cu: CurrentUserApi | undefined,
  isLawyer: boolean
): boolean {
  if (!cu) return false;
  if (!isLawyer) return basicFieldsDirty(form, cu);
  return (
    basicFieldsDirty(form, cu) || lawyerFieldsDirty(form, cu.lawyerProfile)
  );
}

function buildLawyerUpdatePayload(
  form: ProfileFormState
): Record<string, unknown> {
  const {
    fullName,
    phone,
    avatarUrl,
    gender,
    dob,
    degree,
    barCouncilId,
    bio,
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    careerStartDate,
    selectedSpecializations,
  } = form;

  const payload: Record<string, unknown> = {
    userProfile: { fullName, phone, avatarUrl },
    gender,
    dob,
    degree,
    barCouncilId,
    bio,
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    lawyerPracticeAreas: selectedSpecializations,
  };

  if (careerStartDate) {
    payload.careerStartDate = new Date(careerStartDate).toISOString();
  }

  return payload;
}

export function useProfilePage() {
  const { setUser, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProfileFormState>(emptyForm);
  const [isUploading, setIsUploading] = useState(false);

  const refreshCurrentUser = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: CURRENT_USER_KEY });
  }, [queryClient]);

  const { data: currentUser, isLoading } = useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: async () => {
      const { data } = await getCurrentUser();
      setUser(data);
      return data as CurrentUserApi;
    },
  });

  useEffect(() => {
    if (currentUser) setForm(formFromCurrentUser(currentUser));
  }, [currentUser]);

  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      refreshCurrentUser();
    },
    onError: () => {
      toast({
        title: 'Update failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
    onSettled: () => setIsUploading(false),
  });

  const updateLawyerMutation = useMutation({
    mutationFn: updateLawyerProfile,
    onSuccess: () => {
      toast({
        title: 'Profile updated',
        description: 'Your lawyer profile has been updated successfully.',
      });
      refreshCurrentUser();
    },
    onError: () => {
      toast({
        title: 'Update failed',
        description: 'Failed to update lawyer profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const patchForm = useCallback((partial: Partial<ProfileFormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  const hasChanges = useCallback(
    (isLawyer: boolean) => formIsDirty(form, currentUser, isLawyer),
    [currentUser, form]
  );

  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const { data } = await uploadAsset(file);
        const avatarUrl = data.assetUrl;
        await updateProfileMutation.mutateAsync({ avatarUrl });
        setForm((prev) => ({ ...prev, avatarUrl }));
       
      } catch (error) {
        console.error('Error uploading avatar:', error);
      } finally {
        setIsUploading(false);
      }
    },
    [updateProfileMutation]
  );

  const handleSaveChanges = useCallback(
    (isLawyer: boolean) => {
      if (isLawyer) {
        updateLawyerMutation.mutate(buildLawyerUpdatePayload(form));
      } else {
        const { fullName, phone } = form;
        updateProfileMutation.mutate({ fullName, phone });
      }
    },
    [form, updateLawyerMutation, updateProfileMutation]
  );

  const toggleSpecialization = useCallback((id: string) => {
    setForm((prev) => {
      const { selectedSpecializations: ids } = prev;
      const next = ids.includes(id)
        ? ids.filter((s) => s !== id)
        : [...ids, id];
      return { ...prev, selectedSpecializations: next };
    });
  }, []);

  return {
    user,
    currentUser,
    isLoading,
    form,
    patchForm,
    fileRef,
    isUploading,
    handleAvatarChange,
    handleSaveChanges,
    hasChanges,
    toggleSpecialization,
    updateProfileMutation,
    updateLawyerMutation,
  };
}

export type ProfilePageController = ReturnType<typeof useProfilePage>;
