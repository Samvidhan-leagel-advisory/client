import type {
  LawyerDocument,
  Pagination,
  PendingLawyerDocumentListItem,
} from '@/types';

export function extractLawyerDocumentsFromResponse(
  payload: unknown
): LawyerDocument[] {
  if (Array.isArray(payload)) return payload as LawyerDocument[];
  if (!payload || typeof payload !== 'object') return [];
  const row = payload as Record<string, unknown>;
  if (Array.isArray(row.data)) return row.data as LawyerDocument[];
  return [];
}

export function extractPendingLawyerDocumentsPage(payload: unknown): {
  data: PendingLawyerDocumentListItem[];
  pagination: Pagination | null;
} {
  if (!payload || typeof payload !== 'object') {
    return { data: [], pagination: null };
  }
  const row = payload as Record<string, unknown>;
  const data = Array.isArray(row.data)
    ? (row.data as PendingLawyerDocumentListItem[])
    : Array.isArray(payload)
      ? (payload as PendingLawyerDocumentListItem[])
      : [];
  const pagination =
    row.pagination && typeof row.pagination === 'object'
      ? (row.pagination as Pagination)
      : null;
  return { data, pagination };
}

export function lawyerDocDisplayName(d: LawyerDocument) {
  return (d.assetName && String(d.assetName).trim()) || 'Document';
}
