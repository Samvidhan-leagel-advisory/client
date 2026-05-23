import { getFileIcon } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import type { CaseMessage, FailedChatMessage, SendingAttachment } from '@/types';
import { AlertCircle, Check, File, Loader2, RefreshCw } from 'lucide-react';
import { useMessageBodyClamp } from '@/hooks/use-message-body-clamp';
import type { ReactNode } from 'react';
import { chatAttachmentLabel } from './case-chat-thread-utils';

/** Long bodies clamp to ~6 lines; optional `betweenBodyAndMeta` (e.g. attachment); “Read more” + `footerRight` (time + ticks) share one row. */
export function MessageBodyCollapsible({
  text,
  className,
  readMoreLinkClassName,
  betweenBodyAndMeta,
  footerRight,
  metaRowClassName,
}: {
  text: string;
  className?: string;
  readMoreLinkClassName?: string;
  betweenBodyAndMeta?: ReactNode;
  footerRight?: ReactNode;
  metaRowClassName?: string;
}) {
  const { textRef, expanded, toggleExpanded, canToggle, lineClampClassName } =
    useMessageBodyClamp(text);

  const showMetaRow = canToggle || footerRight != null;

  return (
    <div className="min-w-0">
      <p
        ref={textRef}
        className={cn(
          className,
          'whitespace-pre-wrap break-words',
          lineClampClassName
        )}
      >
        {text}
      </p>
      {betweenBodyAndMeta}
      {showMetaRow ? (
        <div
          className={cn(
            'mt-0.5 flex w-full min-w-0 items-end',
            footerRight != null ? 'justify-between gap-1' : 'justify-end',
            metaRowClassName
          )}
        >
          <div
            className={cn(
              'min-w-0',
              footerRight != null && 'flex-1'
            )}
          >
            {canToggle ? (
              <button
                type="button"
                onClick={toggleExpanded}
                className={cn(
                  'text-left text-xs font-semibold tracking-tight hover:underline',
                  readMoreLinkClassName
                )}
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            ) : null}
          </div>
          {footerRight != null ? (
            <span className="flex shrink-0 items-center gap-1 leading-none">
              {footerRight}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-2">
      <span className="rounded-full bg-black/10 px-3 py-1 text-[11px] font-medium text-foreground/60 shadow-sm">
        {label}
      </span>
    </div>
  );
}

export function MsgSendingTick({ className }: { className?: string }) {
  return (
    <Check
      className={cn('h-3 w-3 shrink-0 stroke-[2.5]', className)}
      aria-label="Sending"
    />
  );
}

export function MsgSentDoubleTick({ className }: { className?: string }) {
  return (
    <span
      className={cn('relative inline-flex h-3 w-[14px] shrink-0', className)}
      aria-label="Sent"
    >
      <Check className="absolute left-0 h-3 w-3 stroke-[2.5]" aria-hidden />
      <Check className="absolute left-[5px] h-3 w-3 stroke-[2.5]" aria-hidden />
    </span>
  );
}

function isChatInlineImage(m: CaseMessage) {
  if (!m.assetUrl) return false;
  if (m.messageType === 'image') return true;
  const hint = `${m.assetName ?? ''} ${m.assetUrl}`.toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/i.test(hint);
}

export function MessageAttachmentRow({
  m,
  onOpen,
}: {
  m: CaseMessage;
  onOpen: () => void;
}) {
  if (!m.assetUrl) return null;
  const label = chatAttachmentLabel(m);
  const icon = getFileIcon(m.assetName || m.assetUrl || 'file');
  if (isChatInlineImage(m)) {
    return (
      <button
        type="button"
        className="mt-1 block w-full overflow-hidden rounded-lg text-left ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={onOpen}
      >
        <img
          src={m.assetUrl}
          alt={label}
          className="max-h-44 w-full object-contain"
        />
      </button>
    );
  }
  return (
    <button
      type="button"
      className="mt-1 flex w-full min-w-0 items-center gap-2 rounded-md border border-border bg-muted/50 px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted"
      onClick={onOpen}
    >
      <span className="flex min-w-0 shrink items-center gap-2">
        <span className="shrink-0">{icon}</span>
        <span className="min-w-0 truncate font-medium">{label}</span>
      </span>
    </button>
  );
}

export function FailedMessageBubble({
  msg,
  conversation,
  compact,
  onRetry,
}: {
  msg: FailedChatMessage;
  conversation: boolean;
  compact: boolean;
  onRetry?: () => void;
}) {
  const inner = (
    <div
      className={cn(
        'max-w-[85%] rounded-xl border border-destructive/40 bg-destructive/5 text-sm text-destructive',
        compact ? 'rounded-lg px-3.5 py-2.5' : 'px-4 py-3',
        conversation && 'max-w-[75%] rounded-2xl'
      )}
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0">
          <p
            className={cn(
              'leading-relaxed text-foreground/80',
              compact ? 'text-[13px]' : 'text-[15px]'
            )}
          >
            {msg.label}
          </p>
          <p className="mt-0.5 text-[11px] opacity-70">{msg.error}</p>
        </div>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 flex items-center gap-1 text-[11px] font-medium text-destructive underline-offset-2 hover:underline"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
      ) : null}
    </div>
  );

  return (
    <div
      className={cn(
        'mt-1 flex',
        conversation ? 'justify-end' : 'flex-col items-end'
      )}
    >
      {inner}
    </div>
  );
}

export function SendingAttachmentRow({
  attachments,
}: {
  attachments: SendingAttachment[];
}) {
  if (attachments.length === 0) return null;
  return (
    <div className="mb-1.5 flex flex-wrap gap-1.5">
      {attachments.map((a, i) =>
        a.previewUrl ? (
          <div
            key={i}
            className="relative h-16 w-16 overflow-hidden rounded-lg"
          >
            <img
              src={a.previewUrl}
              alt=""
              className="h-full w-full object-cover opacity-60 blur-sm"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        ) : (
          <div
            key={i}
            className="flex items-center gap-1 rounded-md border border-border/60 bg-muted/80 px-2 py-1 text-[11px]"
          >
            <File className="h-3 w-3 shrink-0" />
            <span className="max-w-[80px] truncate">{a.name}</span>
          </div>
        )
      )}
    </div>
  );
}
