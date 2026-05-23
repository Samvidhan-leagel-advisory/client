import type { FieldErrors } from '@/types';
import { useState } from 'react';

export const useFormErrors = () => {
  const [errors, setErrors] = useState<FieldErrors>({});

  const clearError = (field: keyof FieldErrors) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const hasErrors = (newErrors: FieldErrors) =>
    Object.keys(newErrors).length > 0;

  const resetErrors = () => setErrors({});

  return { errors, setErrors, clearError, hasErrors, resetErrors };
};
