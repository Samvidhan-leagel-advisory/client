import type {
  CaseChatConnectionStatus,
  CaseChatThreadProps,
  CaseMessage,
  UserRole,
} from '@/types';

export const MAX_CHAT_TEXT_LENGTH = 10000;
export const COMPOSER_TEXTAREA_MAX_HEIGHT_PX = 160;

export function statusLabel(status: CaseChatConnectionStatus): string {
  switch (status) {
    case 'connecting':
      return 'Connecting…';
    case 'reconnecting':
      return 'Reconnecting…';
    case 'open':
      return 'Live';
    case 'error':
      return 'Connection failed';
    default:
      return '';
  }
}

export function statusColor(status: CaseChatConnectionStatus): string {
  if (status === 'open') return 'text-emerald-600';
  if (status === 'error') return 'text-destructive';
  if (status === 'reconnecting') return 'text-amber-500';
  return '';
}

export function bubbleClasses(senderRole: UserRole): string {
  if (senderRole === 'user') return 'bg-muted';
  if (senderRole === 'admin') return 'bg-violet-950/90 text-primary-foreground';
  return 'bg-navy text-primary-foreground';
}

export function roleLabel(role: UserRole) {
  if (role === 'lawyer') return 'Lawyer';
  if (role === 'admin') return 'Admin';
  return 'User';
}

export function roleLabelColor(role: UserRole): string {
  if (role === 'lawyer') return 'text-amber-600';
  if (role === 'admin') return 'text-violet-600';
  return 'text-sky-600';
}

export function formatMessageTimeOnly(ts: string) {
  return new Date(ts).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDateKey(ts: string): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatDateSeparator(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = (today.getTime() - msgDay.getTime()) / 86400000;
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function isOwnBubble(
  m: CaseMessage,
  viewerParticipant: UserRole | null | undefined,
  variant: CaseChatThreadProps['variant']
): boolean {
  if (viewerParticipant) return m.senderRole === viewerParticipant;
  if (variant === 'user') return m.senderRole === 'user';
  if (variant === 'admin') return m.senderRole === 'admin';
  return false;
}

export function chatAttachmentLabel(m: CaseMessage) {
  return (m.assetName || '').trim() || 'Attachment';
}
