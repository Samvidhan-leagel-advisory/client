import type { AuthUser } from '@/types';

/** Lawyer may use the product (cases, chat, etc.) only after profile is complete and admin has verified. */
export function isLawyerApprovedForPractice(user: AuthUser | null): boolean {
  const lp = user?.lawyerProfile;
  if (!lp) return false;
  return lp.isProfileCompleted === true && lp.isVerified === true;
}
