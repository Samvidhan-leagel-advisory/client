import { proxyAsset } from '@/api-client';
import logoUrl from '@/assets/logo.png';
import signUrl from '@/assets/sign.png';
import { SamvidhanCardPdfDocument } from '@/components/pdf/SamvidhanCardPdfTemplate';
import '@/lib/buffer-polyfill';
import { pdf } from '@react-pdf/renderer';
import { createElement } from 'react';

export type SamvidhanCardPdfData = {
  title: string;
  logoUrl: string;
  signatureUrl: string;
  name: string;
  memberNo: string;
  userMobileNo: string;
  photoUrl?: string;
  memStartDate?: string;
  memEndDate?: string;
};

type BuildCardInput = {
  memberName: string;
  memNumber: string;
  photoUrl?: string;
  userMobileNo: string;
  memStartDate: string;
  memEndDate?: string;
};

/**
 * react-pdf only renders PNG/JPEG. Member avatars are often WebP, which it
 * silently drops, so re-encode any source image to PNG via a canvas.
 */
async function toPngDataUri(dataUri: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to decode member photo'));
    img.src = dataUri;
  });
}

// Formats react-pdf can embed directly. Anything else (e.g. webp) must be
// re-encoded to PNG first.
const PDF_SAFE_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

function isPdfSafeImage(dataUri: string): boolean {
  const mime = dataUri.slice(5, dataUri.indexOf(';')).toLowerCase();
  return PDF_SAFE_IMAGE_TYPES.includes(mime);
}

async function resolvePhotoDataUri(
  photoUrl?: string
): Promise<string | undefined> {
  if (!photoUrl) return undefined;
  const sourceDataUri = photoUrl.startsWith('data:')
    ? photoUrl
    : ((await proxyAsset(photoUrl)).data.dataUri as string | undefined);
  if (!sourceDataUri) return undefined;
  if (isPdfSafeImage(sourceDataUri)) return sourceDataUri;
  try {
    return await toPngDataUri(sourceDataUri);
  } catch {
    return sourceDataUri;
  }
}

async function buildCardData(
  input: BuildCardInput
): Promise<SamvidhanCardPdfData> {
  return {
    title: `${input.memberName}-${input.memNumber}-samvidhan-legal-advisory-card`,
    logoUrl,
    signatureUrl: signUrl,
    name: input.memberName,
    memberNo: input.memNumber,
    userMobileNo: input.userMobileNo,
    photoUrl: await resolvePhotoDataUri(input.photoUrl),
    memStartDate: input.memStartDate,
    memEndDate: input.memEndDate,
  };
}

function isReactNativeWebView(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof (
      window as Window & {
        ReactNativeWebView?: { postMessage: (msg: string) => void };
      }
    ).ReactNativeWebView?.postMessage === 'function'
  );
}

async function blobToBase64(blob: Blob): Promise<string> {
  // Prefer arrayBuffer → btoa path (works in all WebView environments).
  if (typeof blob.arrayBuffer === 'function') {
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  // Fallback: FileReader (browser desktop).
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Failed to read PDF blob'));
        return;
      }
      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error('Failed to encode PDF'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error('Failed to read PDF blob'));
    reader.readAsDataURL(blob);
  });
}

async function savePdfBlob(blob: Blob, filename: string): Promise<void> {
  // WebView: programmatic <a download> is ignored — hand off to the native shell.
  if (isReactNativeWebView()) {
    const base64 = await blobToBase64(blob);
    const bridge = (
      window as unknown as {
        ReactNativeWebView: { postMessage: (msg: string) => void };
      }
    ).ReactNativeWebView;
    bridge.postMessage(
      JSON.stringify({ type: 'DOWNLOAD_PDF', filename, base64 })
    );
    return;
  }

  // Always use direct download — no share sheet.
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

export async function downloadSamvidhanAdvisoryCardPdf(
  input: BuildCardInput
): Promise<void> {
  const data = await buildCardData(input);
  const doc = createElement(SamvidhanCardPdfDocument, { data });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = await pdf(doc as any).toBlob();
  await savePdfBlob(blob, `${data.title}.pdf`);
}
