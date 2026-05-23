import '@/lib/buffer-polyfill';
import logoUrl from '@/assets/logo.png';
import signUrl from '@/assets/sign.png';
import { proxyAsset } from '@/api-client';
import { SamvidhanCardPdfDocument } from '@/components/pdf/SamvidhanCardPdfTemplate';
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

async function resolvePhotoDataUri(photoUrl?: string): Promise<string | undefined> {
  if (!photoUrl) return undefined;
  if (photoUrl.startsWith('data:')) return photoUrl;
  const { data } = await proxyAsset(photoUrl);
  return data.dataUri;
}

async function buildCardData(input: BuildCardInput): Promise<SamvidhanCardPdfData> {
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
      window as Window & { ReactNativeWebView?: { postMessage: (msg: string) => void } }
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
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read PDF blob'));
    reader.readAsDataURL(blob);
  });
}

async function savePdfBlob(blob: Blob, filename: string): Promise<void> {
  // WebView: programmatic <a download> is ignored — hand off to the native shell.
  if (isReactNativeWebView()) {
    const base64 = await blobToBase64(blob);
    const bridge = (window as unknown as { ReactNativeWebView: { postMessage: (msg: string) => void } })
      .ReactNativeWebView;
    bridge.postMessage(JSON.stringify({ type: 'DOWNLOAD_PDF', filename, base64 }));
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
