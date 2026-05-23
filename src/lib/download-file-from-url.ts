import apiClient from '@/api-client/axios';
import { env } from '@/config/env';

function normalizeAssetUrl(raw: string): string {
  const url = raw.trim();
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = env.apiBaseUrl.replace(/\/$/, '');
  return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
}

function urlOrigin(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename.trim() || 'download';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

/**
 * Downloads a remote file locally. Prefers a blob response so the browser saves
 * instead of navigating away (no `window.open`).
 */
export async function downloadFileFromUrl(
  rawUrl: string,
  filename: string
): Promise<void> {
  const safeName = filename.trim() || 'download';
  const url = normalizeAssetUrl(rawUrl);
  if (!url) return;

  const origin = urlOrigin(url);
  const apiOrigin = env.apiOrigin;

  const tryBlob = async (blobLoader: () => Promise<Blob>): Promise<boolean> => {
    try {
      const blob = await blobLoader();
      if (!blob || blob.size === 0) return false;
      triggerBlobDownload(blob, safeName);
      return true;
    } catch {
      return false;
    }
  };

  // Assets on our API origin: cookies + role headers (axios) usually succeed where raw fetch fails.
  if (origin && apiOrigin && origin === apiOrigin) {
    const ok = await tryBlob(async () => {
      const { data } = await apiClient.get(url, { responseType: 'blob' });
      return data as Blob;
    });
    if (ok) return;
  }

  const creds: RequestCredentials =
    origin &&
    (origin === apiOrigin || origin === window.location.origin)
      ? 'include'
      : 'omit';

  const fetched = await tryBlob(async () => {
    const res = await fetch(url, { credentials: creds, mode: 'cors' });
    if (!res.ok) throw new Error(String(res.status));
    return res.blob();
  });
  if (fetched) return;

  // Same-origin only: `download` is honored. Avoid target=_blank so we never spawn a tab on purpose.
  if (origin === window.location.origin) {
    const a = document.createElement('a');
    a.href = url;
    a.download = safeName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }

  const a = document.createElement('a');
  a.href = url;
  a.download = safeName;
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
