import { FileViewer } from '@/components/FileViewer';
import { ChatSkeleton } from '@/components/skeletons/ChatSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useChatThreadScroll } from '@/hooks/use-chat-thread-scroll';
import { useComposerEmojiInsert } from '@/hooks/use-composer-emoji-insert';
import { useMessageBodyClamp } from '@/hooks/use-message-body-clamp';
import { cn } from '@/lib/utils';
import type { CaseChatThreadProps, CaseMessage } from '@/types';
import EmojiPicker from 'emoji-picker-react';
import { ArrowUp, ChevronDown, Loader2, Send, Smile } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DateSeparator,
  FailedMessageBubble,
  MessageAttachmentRow,
  MessageBodyCollapsible,
  MsgSendingTick,
  MsgSentDoubleTick,
  SendingAttachmentRow,
} from './case-chat-thread-parts';
import {
  bubbleClasses,
  chatAttachmentLabel,
  COMPOSER_TEXTAREA_MAX_HEIGHT_PX,
  formatDateSeparator,
  formatMessageTimeOnly,
  getDateKey,
  isOwnBubble,
  MAX_CHAT_TEXT_LENGTH,
  roleLabel,
  roleLabelColor,
  statusColor,
  statusLabel,
} from './case-chat-thread-utils';

function StackCaseMessageBody({
  message,
  compact,
  darkBubble,
  firstInGroup,
  own,
  onOpenAttachment,
}: {
  message: CaseMessage;
  compact: boolean;
  darkBubble: boolean;
  firstInGroup: boolean;
  own: boolean;
  onOpenAttachment: (m: CaseMessage) => void;
}) {
  const role = message.senderRole ?? 'user';
  const text = message.content ?? '';
  const clamp = useMessageBodyClamp(text);

  return (
    <>
      <p
        ref={clamp.textRef}
        className={cn(
          'whitespace-pre-wrap break-words leading-relaxed',
          compact ? 'text-[13px]' : 'text-[15px]',
          clamp.lineClampClassName
        )}
      >
        {text}
      </p>
      <MessageAttachmentRow
        m={message}
        onOpen={() => onOpenAttachment(message)}
      />
      <div
        className={cn(
          'border-current/10 mt-1.5 flex w-full min-w-0 items-end justify-between gap-1 border-t pt-1 text-[9px] leading-none opacity-75',
          darkBubble
            ? 'text-primary-foreground/75'
            : 'text-muted-foreground'
        )}
      >
        <div className="flex min-w-0 flex-1 items-end gap-2">
          {firstInGroup ? (
            <span className="flex min-w-0 shrink-0 items-center gap-1">
              <Send
                className="size-2.5 shrink-0 opacity-80"
                strokeWidth={2.5}
                aria-hidden
              />
              <span className="truncate font-medium uppercase tracking-wide">
                {roleLabel(role)}
              </span>
            </span>
          ) : null}
          {clamp.canToggle ? (
            <button
              type="button"
              onClick={clamp.toggleExpanded}
              className={cn(
                'text-left text-xs font-semibold tracking-tight hover:underline',
                darkBubble
                  ? 'text-primary-foreground/90'
                  : 'text-sky-600'
              )}
            >
              {clamp.expanded ? 'Show less' : 'Read more'}
            </button>
          ) : null}
        </div>
        <span className="flex shrink-0 items-center gap-1 leading-none">
          <time className="tabular-nums" dateTime={message.timestamp}>
            {formatMessageTimeOnly(message.timestamp)}
          </time>
          {own ? (
            <MsgSentDoubleTick
              className={
                darkBubble
                  ? 'text-primary-foreground/70'
                  : 'text-muted-foreground'
              }
            />
          ) : null}
        </span>
      </div>
    </>
  );
}

export function CaseChatThread({
  variant,
  title,
  messages,
  viewerParticipant,
  draft,
  onDraftChange,
  onSend,
  composer,
  status,
  sendingText,
  sendingAttachments = [],
  failedMessages = [],
  onRetryFailed,
  hasOlderMessages,
  isLoadingOlder,
  onLoadOlder,
  isLoadingMessages,
  beforeSendActions,
  composerAccessory,
  hasComposerAttachment = false,
  isComposerBusy = false,
  panelStyle,
  showThreadHeader = true,
  messageLayout = 'stack',
  rootClassName,
  composerOverPattern = false,
}: CaseChatThreadProps) {
  const compact = variant === 'admin';
  const conversation = messageLayout === 'conversation';
  const isSending =
    Boolean(sendingText?.trim()) || sendingAttachments.length > 0;
  const hasSendableContent = draft.trim().length > 0 || hasComposerAttachment;
  const canSend =
    status === 'open' && hasSendableContent && !isSending && !isComposerBusy;
  const live = statusLabel(status);
  const charCount = draft.length;

  const [attachmentViewerOpen, setAttachmentViewerOpen] = useState(false);
  const [attachmentViewer, setAttachmentViewer] = useState<{
    name: string;
    url: string;
  } | null>(null);
  const openChatAttachment = (m: CaseMessage) => {
    if (!m.assetUrl) return;
    setAttachmentViewer({ name: chatAttachmentLabel(m), url: m.assetUrl });
    setAttachmentViewerOpen(true);
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const autoGrow = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, COMPOSER_TEXTAREA_MAX_HEIGHT_PX)}px`;
  }, []);

  const resetTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
  }, []);

  const { emojiPickerOpen, setEmojiPickerOpen, insertEmoji } =
    useComposerEmojiInsert({
      textareaRef,
      inputRef,
      composer,
      draft,
      maxLength: MAX_CHAT_TEXT_LENGTH,
      onDraftChange,
      onAfterEmojiInsertTextarea: autoGrow,
    });

  useEffect(() => {
    if (!draft) resetTextarea();
  }, [draft, resetTextarea]);

  const newestMessageId = messages[messages.length - 1]?.id;

  const {
    scrollRef,
    onScroll,
    scrollToBottom,
    showScrollToBottom,
    lockLoadOlder,
  } = useChatThreadScroll({
    isLoadingOlder,
    isLoadingMessages,
    messagesLength: messages.length,
    newestMessageId,
    isSending,
    loadOlder:
      hasOlderMessages && onLoadOlder
        ? { isLoading: isLoadingOlder, onLoadOlder }
        : null,
  });

  const isFirstInGroup = (index: number): boolean => {
    if (index === 0) return true;
    return messages[index].senderRole !== messages[index - 1].senderRole;
  };

  const isNewDate = (index: number): boolean => {
    if (index === 0) return true;
    return (
      getDateKey(messages[index].timestamp) !==
      getDateKey(messages[index - 1].timestamp)
    );
  };

  const scrollAreaClass = cn(
    /* overscroll-behavior: contain — stops scroll chaining to the WebView document (Android shell pull-to-refresh / rubber-band). */
    'scrollbar-hide flex-1 min-h-0 touch-pan-y overflow-y-auto overscroll-y-contain',
    conversation
      ? cn('py-2', composerOverPattern ? 'px-4 md:px-6 lg:px-8' : 'px-1')
      : 'p-4'
  );

  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-col rounded-xl border bg-card',
        rootClassName
      )}
      style={panelStyle}
    >
      {showThreadHeader ? (
        <div
          className={cn(
            'flex shrink-0 items-center justify-between gap-2 overflow-hidden border-b',
            compact ? 'bg-muted/20 px-4 py-2.5' : 'p-3'
          )}
        >
          <h3
            className={
              compact
                ? 'text-xs font-semibold uppercase tracking-wider text-muted-foreground'
                : 'text-sm font-semibold'
            }
          >
            {title}
          </h3>
          <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
            {live ? (
              <span className={statusColor(status)}>
                {status === 'reconnecting' ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {live}
                  </span>
                ) : (
                  live
                )}
              </span>
            ) : null}
            <span>
              {messages.length} loaded
              {hasOlderMessages ? (
                <span className="text-muted-foreground/80"> · more above</span>
              ) : null}
            </span>
          </div>
        </div>
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div ref={scrollRef} className={scrollAreaClass} onScroll={onScroll}>
          {hasOlderMessages && !isLoadingOlder && onLoadOlder ? (
            <div className="flex justify-center pb-2 pt-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  lockLoadOlder();
                  onLoadOlder();
                }}
              >
                Load older messages
              </Button>
            </div>
          ) : null}
          {isLoadingOlder ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : null}
          {isLoadingMessages && messages.length === 0 && !isSending ? (
            <ChatSkeleton />
          ) : null}
          {!isLoadingMessages && messages.length === 0 && !isSending ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {compact
                ? 'No messages yet.'
                : 'No messages yet. Start the conversation.'}
            </p>
          ) : null}
          {(messages.length > 0 || isSending) && !isLoadingMessages ? (
            <>
              {messages.map((m, index) => {
                const role = m.senderRole ?? 'user';
                const own = isOwnBubble(m, viewerParticipant, variant);
                const firstInGroup = isFirstInGroup(index);
                const showDate = isNewDate(index);

                if (conversation) {
                  return (
                    <div key={m.id}>
                      {showDate ? (
                        <DateSeparator
                          label={formatDateSeparator(m.timestamp)}
                        />
                      ) : null}
                      <div
                        className={cn(
                          'flex',
                          own ? 'justify-end' : 'justify-start',
                          firstInGroup && !showDate
                            ? 'mt-3'
                            : !firstInGroup
                              ? 'mt-0.5'
                              : 'mt-1'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm',
                            own
                              ? 'bg-[#e7f5cb] text-[#111b21]'
                              : 'bg-white/95 text-[#111b21]'
                          )}
                        >
                          {firstInGroup && !own ? (
                            <p
                              className={cn(
                                'mb-0.5 text-[12px] font-semibold',
                                roleLabelColor(role)
                              )}
                            >
                              {roleLabel(role)}
                            </p>
                          ) : null}
                          {(m.content?.length ?? 0) > 0 ? (
                            <MessageBodyCollapsible
                              text={m.content}
                              className="leading-relaxed text-[#111b21]"
                              readMoreLinkClassName="text-[#0277BD]"
                              betweenBodyAndMeta={
                                <MessageAttachmentRow
                                  m={m}
                                  onOpen={() => openChatAttachment(m)}
                                />
                              }
                              footerRight={
                                <>
                                  <span>{formatMessageTimeOnly(m.timestamp)}</span>
                                  {own ? (
                                    <MsgSentDoubleTick className="text-[#8696a0]" />
                                  ) : null}
                                </>
                              }
                              metaRowClassName="text-[10px] text-[#111b21]/40"
                            />
                          ) : (
                            <>
                              <MessageAttachmentRow
                                m={m}
                                onOpen={() => openChatAttachment(m)}
                              />
                              <p className="mt-0.5 flex items-center justify-end gap-1 text-right text-[10px] text-[#111b21]/40">
                                <span>{formatMessageTimeOnly(m.timestamp)}</span>
                                {own ? (
                                  <MsgSentDoubleTick className="text-[#8696a0]" />
                                ) : null}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                const darkBubble = role === 'admin' || role === 'lawyer';
                return (
                  <div key={m.id}>
                    {showDate ? (
                      <DateSeparator label={formatDateSeparator(m.timestamp)} />
                    ) : null}
                    <div
                      className={cn(
                        'flex flex-col',
                        own ? 'items-end' : 'items-start',
                        firstInGroup && !showDate
                          ? 'mt-3'
                          : !firstInGroup
                            ? 'mt-0.5'
                            : 'mt-1'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[85%] rounded-xl text-sm',
                          bubbleClasses(role),
                          compact ? 'rounded-lg px-3.5 py-2.5' : 'px-4 py-3'
                        )}
                      >
                        {(m.content?.length ?? 0) > 0 ? (
                          <StackCaseMessageBody
                            message={m}
                            compact={compact}
                            darkBubble={darkBubble}
                            firstInGroup={firstInGroup}
                            own={own}
                            onOpenAttachment={openChatAttachment}
                          />
                        ) : (
                          <>
                            <MessageAttachmentRow
                              m={m}
                              onOpen={() => openChatAttachment(m)}
                            />
                            <div
                              className={cn(
                                'border-current/10 mt-1.5 flex items-center justify-between gap-2 border-t pt-1 text-[9px] leading-none opacity-75',
                                darkBubble
                                  ? 'text-primary-foreground/75'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {firstInGroup ? (
                                <span className="flex min-w-0 items-center gap-1">
                                  <Send
                                    className="size-2.5 shrink-0 opacity-80"
                                    strokeWidth={2.5}
                                    aria-hidden
                                  />
                                  <span className="truncate font-medium uppercase tracking-wide">
                                    {roleLabel(role)}
                                  </span>
                                </span>
                              ) : (
                                <span />
                              )}
                              <span className="flex shrink-0 items-center gap-1">
                                <time
                                  className="tabular-nums"
                                  dateTime={m.timestamp}
                                >
                                  {formatMessageTimeOnly(m.timestamp)}
                                </time>
                                {own ? (
                                  <MsgSentDoubleTick
                                    className={
                                      darkBubble
                                        ? 'text-primary-foreground/70'
                                        : 'text-muted-foreground'
                                    }
                                  />
                                ) : null}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {failedMessages.map((fm) => (
                <FailedMessageBubble
                  key={fm.clientMessageId}
                  msg={fm}
                  conversation={conversation}
                  compact={compact}
                  onRetry={
                    onRetryFailed
                      ? () => onRetryFailed(fm.clientMessageId)
                      : undefined
                  }
                />
              ))}
              {isSending ? (
                conversation ? (
                  <div className="mt-0.5 flex justify-end">
                    <div className="max-w-[75%] rounded-2xl bg-[#e7f5cb]/70 px-3.5 py-2 text-sm shadow-sm">
                      <SendingAttachmentRow attachments={sendingAttachments} />
                      {(sendingText?.length ?? 0) > 0 ? (
                        <MessageBodyCollapsible
                          text={sendingText}
                          className="leading-relaxed text-[#111b21]/70"
                          readMoreLinkClassName="text-[#0277BD]/90"
                          footerRight={<MsgSendingTick />}
                          metaRowClassName="text-[10px] text-[#8696a0]"
                        />
                      ) : (
                        <p className="mt-0.5 flex justify-end text-[10px] text-[#8696a0]">
                          <MsgSendingTick />
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    <div
                      className={cn(
                        'max-w-[85%] rounded-xl border border-dashed border-border/80 bg-muted/50 text-muted-foreground',
                        compact ? 'rounded-lg px-3.5 py-2.5' : 'px-4 py-3'
                      )}
                    >
                      <SendingAttachmentRow attachments={sendingAttachments} />
                      {(sendingText?.length ?? 0) > 0 ? (
                        <MessageBodyCollapsible
                          text={sendingText}
                          className={cn(
                            'leading-relaxed',
                            compact ? 'text-[13px]' : 'text-[15px]'
                          )}
                          readMoreLinkClassName="text-foreground/80"
                          footerRight={<MsgSendingTick className="h-3.5 w-3.5" />}
                          metaRowClassName="mt-1.5 border-t border-border/40 pt-1 text-muted-foreground opacity-90"
                        />
                      ) : (
                        <div className="mt-1.5 flex items-center justify-end border-t border-border/40 pt-1 text-muted-foreground opacity-90">
                          <MsgSendingTick className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              ) : null}
            </>
          ) : null}
        </div>

        {showScrollToBottom ? (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute bottom-4 right-4 z-10 h-10 w-10 rounded-full border border-border/70 bg-background/90 shadow-md backdrop-blur-sm hover:bg-background"
            onClick={scrollToBottom}
            aria-label="Jump to latest messages"
          >
            <ChevronDown className="h-5 w-5 shrink-0" />
          </Button>
        ) : null}
      </div>

      <div
        className={
          composerOverPattern
            ? 'flex shrink-0 flex-col gap-1 bg-transparent px-4 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] md:px-6 lg:px-8'
            : 'flex shrink-0 flex-col gap-1 bg-background/80 px-3 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] backdrop-blur-sm'
        }
      >
        <div
          className={cn(
            'flex flex-col gap-0.5 rounded-[1.35rem] border p-2 shadow-sm',
            compact && 'rounded-2xl',
            composerOverPattern
              ? 'border-black/[0.06] bg-[hsl(40_28%_98%/0.96)] shadow-md'
              : 'border-border/80 bg-muted/60'
          )}
        >
          {composerAccessory}
          {composer === 'textarea' ? (
            <Textarea
              ref={textareaRef}
              placeholder="Type a message…"
              value={draft}
              onChange={(e) => {
                onDraftChange(e.target.value);
                autoGrow();
              }}
              style={{ maxHeight: COMPOSER_TEXTAREA_MAX_HEIGHT_PX }}
              className={cn(
                'min-h-[40px] w-full resize-none overflow-y-auto border-0 bg-transparent px-2.5 py-2 text-[15px] leading-snug shadow-none',
                'placeholder:text-muted-foreground/80',
                'focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
              )}
              rows={1}
              maxLength={MAX_CHAT_TEXT_LENGTH}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (canSend) {
                    onSend();
                    resetTextarea();
                  }
                }
              }}
            />
          ) : (
            <Input
              ref={inputRef}
              placeholder="Type a message…"
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              className="h-auto min-h-10 w-full border-0 bg-transparent px-2.5 py-2 text-sm shadow-none file:text-foreground focus-visible:ring-1 focus-visible:ring-ring/40 focus-visible:ring-offset-0"
              maxLength={MAX_CHAT_TEXT_LENGTH}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (canSend) onSend();
                }
              }}
            />
          )}
          <div className="flex items-center justify-between gap-2 px-0.5 pb-0.5 pt-1">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-0.5 [&_button]:h-9 [&_button]:w-9 [&_button]:shrink-0 [&_button]:rounded-full">
              <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Insert emoji"
                  >
                    <Smile className="h-5 w-5 stroke-[2]" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" side="top" className="w-auto p-0">
                  <EmojiPicker onEmojiClick={(d) => insertEmoji(d.emoji)} />
                </PopoverContent>
              </Popover>
              {beforeSendActions}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!canSend}
              className={cn(
                'h-9 w-9 shrink-0 rounded-full shadow-sm',
                canSend
                  ? 'bg-foreground text-background hover:bg-foreground/90 hover:text-background'
                  : 'bg-muted/80 text-muted-foreground hover:bg-muted/80 hover:text-muted-foreground'
              )}
              onClick={() => {
                if (canSend) onSend();
              }}
              aria-label="Send message"
            >
              {status === 'connecting' ||
              status === 'reconnecting' ||
              isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4 stroke-[2.5]" />
              )}
            </Button>
          </div>
        </div>
        {charCount > MAX_CHAT_TEXT_LENGTH - 200 ? (
          <p
            className={cn(
              'self-end text-[11px] tabular-nums',
              charCount >= MAX_CHAT_TEXT_LENGTH
                ? 'text-destructive'
                : 'text-muted-foreground'
            )}
          >
            {charCount}/{MAX_CHAT_TEXT_LENGTH}
          </p>
        ) : null}
      </div>

      {attachmentViewer ? (
        <FileViewer
          open={attachmentViewerOpen}
          onOpenChange={(open) => {
            setAttachmentViewerOpen(open);
            if (!open) setAttachmentViewer(null);
          }}
          fileName={attachmentViewer.name}
          fileUrl={attachmentViewer.url}
        />
      ) : null}
    </div>
  );
}
