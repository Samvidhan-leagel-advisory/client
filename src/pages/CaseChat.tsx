import {
  markAdminCaseChatRead,
  markCaseChatRead,
  uploadAsset,
} from '@/api-client';
import whatsappBg from '@/assets/whatsapp-bg.jpg';
import { CaseChatThread } from '@/components/case-chat/CaseChatThread';
import { GenericTooltip } from '@/components/GenericTooltip';
import { Button } from '@/components/ui/button';
import { path } from '@/constants';
import { useAttachments } from '@/hooks/use-attachments';
import { useCaseChatSocket } from '@/hooks/use-case-chat-socket';
import { useCaseMessages } from '@/hooks/use-case-messages';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/layouts/AdminLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { CASE_DOCUMENT_ACCEPT, getCookie } from '@/lib/helpers';
import {
  isReactNativeWebView,
  postNativeWebViewMessage,
} from '@/lib/is-react-native-webview';
import { getApiErrorMessage } from '@/lib/utils';
import type { UserRole } from '@/types';
import { ArrowLeft, File, Loader2, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom';

/** Single source for case-chat wallpaper (composer stays transparent so this shows through). */
const CASE_CHAT_SURFACE = '#e8e6df';
const caseChatPatternStyle = (src: string): CSSProperties => ({
  backgroundImage: `url(${src})`,
  backgroundRepeat: 'repeat',
  backgroundSize: '450px auto',
  opacity: 0.38,
});

export default function CaseChatPage() {
  const { id } = useParams();
  const location = useLocation();

  useEffect(() => {
    if (!isReactNativeWebView()) return;
    postNativeWebViewMessage({ type: 'NATIVE_PULL_TO_REFRESH', enabled: false });
    return () => {
      postNativeWebViewMessage({ type: 'NATIVE_PULL_TO_REFRESH', enabled: true });
    };
  }, [location.pathname, id]);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const isAdmin = location.pathname.startsWith('/admin');
  const activeRole = getCookie('x-active-role');
  const viewerParticipant: UserRole = isAdmin
    ? 'admin'
    : activeRole === 'lawyer'
      ? 'lawyer'
      : 'user';

  const caseTitle =
    searchParams.get('title') ||
    (location.state as { title?: string } | null)?.title ||
    'Case Chat';
  const shortCaseTitle =
    caseTitle.length > 10 ? `${caseTitle.slice(0, 10)}…` : caseTitle;

  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { attachments, isFull, add, remove, clear } = useAttachments(id);

  const messagesVariant = isAdmin ? 'admin' : 'user';
  const {
    messages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending: isMessagesPending,
  } = useCaseMessages(id, messagesVariant);

  const tailMessage = messages[messages.length - 1];
  const {
    status: chatStatus,
    send: sendChat,
    sendingText,
    failedMessages,
    retryFailed,
  } = useCaseChatSocket({
    caseId: id,
    variant: messagesVariant,
    enabled: Boolean(id),
    markRead: isAdmin ? markAdminCaseChatRead : markCaseChatRead,
    isMessagesPending,
    tailMessageId: tailMessage?.id,
    tailFromViewer: tailMessage?.senderRole === viewerParticipant,
  });

  const handleSend = async () => {
    const text = message.trim();

    if (attachments.length > 0 && id) {
      setIsUploading(true);
      try {
        const uploaded = await Promise.all(
          attachments.map((a) => uploadAsset(a.file).then((r) => r.data))
        );
        uploaded.forEach((asset, i) => {
          sendChat({
            assetUrl: asset.assetUrl,
            assetName: asset.assetName || attachments[i].file.name,
            ...(i === 0 && text ? { text } : {}),
          });
        });
        clear();
        setMessage('');
      } catch (err) {
        toast({
          title: 'Upload failed',
          description: getApiErrorMessage(err),
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
      }
      return;
    }

    sendChat(message);
    setMessage('');
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) add(file);
  };

  const Layout = isAdmin ? AdminLayout : DashboardLayout;

  const backLink = isAdmin ? path.adminCase(id) : path.caseDetail(id);

  return (
    <Layout>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-3 py-2 md:gap-3 md:px-6 md:py-3 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
            asChild
          >
            <Link to={backLink} aria-label="Back to case">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <GenericTooltip
            content={caseTitle}
            side="bottom"
            className="min-w-0 flex-1"
          >
            <p className="text-sm font-semibold leading-none text-foreground">
              {shortCaseTitle}
            </p>
          </GenericTooltip>
        </div>

        <div
          className="relative flex min-h-0 flex-1 flex-col"
          style={{ backgroundColor: CASE_CHAT_SURFACE }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={caseChatPatternStyle(whatsappBg)}
          />
          <div className="relative flex min-h-0 flex-1 flex-col">
            <CaseChatThread
              key={id}
              variant={messagesVariant}
              title="Case communication"
              messages={messages}
              viewerParticipant={viewerParticipant}
              draft={message}
              onDraftChange={setMessage}
              onSend={() => void handleSend()}
              composer="textarea"
              status={chatStatus}
              sendingText={sendingText}
              failedMessages={failedMessages}
              onRetryFailed={retryFailed}
              hasOlderMessages={Boolean(hasNextPage)}
              sendingAttachments={
                isUploading
                  ? attachments.map((a) => ({
                      previewUrl: a.previewUrl,
                      name: a.file.name,
                    }))
                  : []
              }
              isLoadingOlder={isFetchingNextPage}
              onLoadOlder={() => void fetchNextPage()}
              isLoadingMessages={isMessagesPending}
              showThreadHeader={false}
              messageLayout="conversation"
              composerOverPattern
              rootClassName="flex min-h-0 flex-1 flex-col rounded-none border-0 bg-transparent shadow-none"
              panelStyle={{ flex: 1, minHeight: 0 }}
              hasComposerAttachment={attachments.length > 0}
              isComposerBusy={isUploading}
              composerAccessory={
                attachments.length > 0 ? (
                  <div className="flex flex-wrap gap-2 border-border/50 px-1 pb-2 pt-0.5">
                    {attachments.map((a, i) => (
                      <AttachmentPreview
                        key={i}
                        attachment={a}
                        onRemove={() => remove(i)}
                      />
                    ))}
                  </div>
                ) : null
              }
              beforeSendActions={
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={CASE_DOCUMENT_ACCEPT}
                    className="hidden"
                    onChange={handleFileSelected}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                    disabled={isUploading || isFull}
                    title={isFull ? 'Max 3 attachments' : 'Attach file'}
                    aria-label="Attach file"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-5 w-5 stroke-[2]" />
                    )}
                  </Button>
                </>
              }
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

function AttachmentPreview({
  attachment,
  onRemove,
}: {
  attachment: { file: File; previewUrl: string | null };
  onRemove: () => void;
}) {
  if (attachment.previewUrl) {
    return (
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-muted">
        <img
          src={attachment.previewUrl}
          alt=""
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          onClick={onRemove}
          aria-label="Remove attachment"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 max-w-[160px] items-center gap-1.5 rounded-lg border border-border/80 bg-muted/50 px-2 py-1.5">
      <File className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
        {attachment.file.name}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-5 w-5 shrink-0 rounded-full"
        onClick={onRemove}
        aria-label="Remove attachment"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
