/** Shared badge styles for case documents (list + admin grid). */
export const caseDocumentRoleStyles: Record<
  string,
  { bg: string; label: string }
> = {
  user: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Client' },
  lawyer: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    label: 'Lawyer',
  },
  admin: {
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    label: 'Admin',
  },
};
