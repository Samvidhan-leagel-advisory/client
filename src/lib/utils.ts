import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RegistrationFields } from '@/types';

export interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string[];
}

export interface LoginErrors {
  email?: string;
  password?: string;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Validation helpers ---

const PASSWORD_RULES = [
  { test: (v: string) => v.length >= 8, message: 'At least 8 characters' },
  { test: (v: string) => /[A-Z]/.test(v), message: 'At least 1 uppercase letter' },
  { test: (v: string) => /[a-z]/.test(v), message: 'At least 1 lowercase letter' },
  { test: (v: string) => /[0-9]/.test(v), message: 'At least 1 number' },
  { test: (v: string) => /[^A-Za-z0-9]/.test(v), message: 'At least 1 special character' },
];

export const validatePassword = (password: string): string[] => {
  return PASSWORD_RULES.filter((rule) => !rule.test(password)).map((rule) => rule.message);
};

export const validatePhone = (phone: string): string | null => {
  const cleaned = phone.replace(/\s+/g, '');
  if (!/^\+?[0-9]{10,15}$/.test(cleaned)) {
    return 'Enter a valid phone number';
  }
  return null;
};

export const validateRegistrationForm = (fields: RegistrationFields): FormErrors => {
  const errors: FormErrors = {};

  if (!fields.name.trim()) errors.name = 'Full name is required';
  if (!fields.email.trim()) errors.email = 'Email is required';

  const phoneError = validatePhone(fields.phone);
  if (!fields.phone.trim()) errors.phone = 'Phone number is required';
  else if (phoneError) errors.phone = phoneError;

  const passwordErrors = validatePassword(fields.password);
  if (!fields.password) errors.password = ['Password is required'];
  else if (passwordErrors.length > 0) errors.password = passwordErrors;

  return errors;
};

export const hasFormErrors = (errors: FormErrors | LoginErrors): boolean => {
  return Object.keys(errors).length > 0;
};

export const validateEmail = (email: string): string | null => {
  if (!email.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email';
  return null;
};

export const validateLoginForm = (fields: { email: string; password: string }): LoginErrors => {
  const errors: LoginErrors = {};

  const emailError = validateEmail(fields.email);
  if (emailError) errors.email = emailError;

  if (!fields.password) errors.password = 'Password is required';
  else if (fields.password.length < 8) errors.password = 'Password must be at least 8 characters';

  return errors;
};

// --- API error helper ---

export const getApiErrorMessage = (err: unknown, fallback = 'Something went wrong. Please try again.'): string => {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;
};

/** Case / document APIs only accept these; asset upload may return jpeg, webp, etc. */
const CASE_DOCUMENT_ASSET_TYPES = new Set([
  'image',
  'pdf',
  'doc',
  'docx',
  'other',
  'png',
]);

export function normalizeCaseDocumentAssetType(
  fromUploadApi: string | undefined,
  file: File
): string {
  const raw = (fromUploadApi ?? '').toLowerCase().trim();
  if (CASE_DOCUMENT_ASSET_TYPES.has(raw)) {
    return raw;
  }
  const ext = file.name.includes('.')
    ? file.name.slice(file.name.lastIndexOf('.') + 1).toLowerCase()
    : '';
  const mime = (file.type ?? '').toLowerCase();

  if (ext === 'png' || mime === 'image/png') {
    return 'png';
  }
  if (
    mime.startsWith('image/') ||
    [
      'jpg',
      'jpeg',
      'webp',
      'gif',
      'bmp',
      'tif',
      'tiff',
      'svg',
      'heic',
      'avif',
    ].includes(ext)
  ) {
    return 'image';
  }
  if (ext === 'pdf' || mime === 'application/pdf') {
    return 'pdf';
  }
  if (ext === 'doc' || mime === 'application/msword') {
    return 'doc';
  }
  if (
    ext === 'docx' ||
    mime ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'docx';
  }
  return 'other';
}
