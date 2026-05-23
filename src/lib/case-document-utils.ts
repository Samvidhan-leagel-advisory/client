import { getFileType } from '@/lib/helpers';
import type { CaseDocument } from '@/types';

/** Short relative label for document cards and lists. */
export function formatCaseDocumentRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function isCaseDocumentImage(
  fileName: string,
  assetType: string
): boolean {
  if (getFileType(fileName) === 'image') return true;
  return ['image', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif'].includes(
    assetType?.toLowerCase()
  );
}

export function caseDocumentDisplayName(doc: CaseDocument): string {
  return doc.assetName || `Untitled.${doc.assetType}`;
}

/** Filename suggested when saving from `assetUrl`. */
export function caseDocumentDownloadFilename(doc: CaseDocument): string {
  const name = doc.assetName?.trim();
  if (name) return name;
  const ext = doc.assetType?.replace(/^\./, '');
  return ext ? `document.${ext}` : 'document';
}

export function caseDocumentShortExtensionLabel(fileName: string): string {
  return fileName.split('.').pop()?.slice(0, 8).toUpperCase() || 'FILE';
}
