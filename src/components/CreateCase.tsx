import { createAdminUserCase, createCase, uploadAsset } from '@/api-client';
import { FileUpload } from '@/components/FileUpload';
import PaywallModal from '@/components/PaywallModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import WithShimmer from '@/components/WithShimmer';
import { useToast } from '@/hooks/use-toast';
import { useActiveSubscription } from '@/hooks/useActiveSubscription';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useCategories } from '@/hooks/useCategories';
import {
  CASE_TITLE_MAX_LENGTH,
  CATEGORY_SKELETON_WIDTHS,
  MAX_FILES,
  MAX_SIZE_MB,
} from '@/lib/mock-data';
import { queryClient } from '@/lib/query-client';
import {
  getApiErrorMessage,
  normalizeCaseDocumentAssetType,
} from '@/lib/utils';
import type { UploadedDoc } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, Mic, MicOff, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';

const uploadFiles = async (files: File[]): Promise<UploadedDoc[]> => {
  const results = await Promise.all(
    files.map(async (file) => {
      const { data } = await uploadAsset(file);
      return {
        assetUrl: data.assetUrl,
        assetType: normalizeCaseDocumentAssetType(data.assetType, file),
        assetName: data.assetName,
      } as UploadedDoc;
    })
  );
  return results;
};

type CreateCaseProps = {
  mode: 'user' | 'admin';
  userId?: string;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  onSuccess?: (caseId?: string) => void;
};

export const CreateCase = ({
  mode,
  userId,
  title = 'Raise a Legal Query',
  subtitle = "Describe your legal issue and we'll connect you with the right advocate.",
  submitLabel,
  onSuccess,
}: CreateCaseProps) => {
  const [categoryId, setCategoryId] = useState('');
  const [caseTitle, setCaseTitle] = useState('');
  const [description, setDescription] = useState('');
  const [descMode, setDescMode] = useState<'text' | 'audio'>('text');
  const [audioDescUrl, setAudioDescUrl] = useState<string | null>(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { isActive } = useActiveSubscription();
  const { toast } = useToast();
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useCategories();

  const onAudioUrl = useCallback((url: string | null) => setAudioDescUrl(url), []);
  const audio = useAudioRecorder(onAudioUrl);

  const isAdmin = mode === 'admin';

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      const documents = files.length > 0 ? await uploadFiles(files) : [];
      const payload = {
        practiceAreaId: categoryId,
        title: caseTitle.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(audioDescUrl ? { audioDescUrl } : {}),
        isEmergency,
        documents,
      };
      if (isAdmin) {
        if (!userId) throw new Error('Missing target user');
        return await createAdminUserCase(userId, payload);
      }
      return await createCase(payload);
    },
    onSuccess: (res) => {
      toast({
        title: 'Case submitted',
        description: isAdmin
          ? 'Case has been created on behalf of the user.'
          : 'Your legal query has been filed. We will assign a lawyer shortly.',
      });
      const createdId =
        (res as { data?: { id?: string } } | undefined)?.data?.id;
      onSuccess?.(createdId);
    },
    onError: (err: unknown) => {
      toast({
        title: 'Submission failed',
        description: getApiErrorMessage(err),
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutateAsync();
    if (isAdmin && userId) {
      await queryClient.invalidateQueries({
        queryKey: ['adminUserCases', userId],
      });
    } else {
      await queryClient.invalidateQueries({ queryKey: ['user-cases'] });
    }
  };

  const handleFileError = (message: string) => {
    toast({
      title: 'File upload error',
      description: message,
      variant: 'destructive',
    });
  };

  const hasDescription = description.trim() || audioDescUrl;
  const isFormValid = categoryId && caseTitle.trim() && hasDescription;

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-muted-foreground">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label>Category</Label>
          {categoriesLoading && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CATEGORY_SKELETON_WIDTHS.map((w, i) => (
                <div key={i} className="rounded-lg border bg-card px-3 py-2.5">
                  <WithShimmer loading className={`h-4 ${w} rounded`} />
                </div>
              ))}
            </div>
          )}
          {categoriesError && (
            <p className="text-sm text-destructive">Failed to load categories.</p>
          )}
          {!categoriesLoading && !categoriesError && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${categoryId === cat.id ? 'border-gold bg-gold/10 text-foreground' : 'bg-card hover:bg-muted'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <Label htmlFor="title">Brief Title</Label>
            <span className="text-xs tabular-nums text-muted-foreground">
              {caseTitle.length}/{CASE_TITLE_MAX_LENGTH}
            </span>
          </div>
          <Input
            id="title"
            placeholder="e.g. Property ownership dispute"
            value={caseTitle}
            maxLength={CASE_TITLE_MAX_LENGTH}
            onChange={(e) => setCaseTitle(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            One line is enough. Put facts and background in the description below (max{' '}
            {CASE_TITLE_MAX_LENGTH} characters).
          </p>
        </div>

        {/* Description — toggle between text and audio */}
        <div className="space-y-2">
          <Label>
            Description{' '}
            <span className="font-normal text-muted-foreground">(text or audio)</span>
          </Label>

          <div className="rounded-lg border bg-card overflow-hidden">
            {/* Tab header */}
            <div className="flex border-b">
              <button
                type="button"
                onClick={() => setDescMode('text')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${descMode === 'text' ? 'bg-background text-foreground border-b-2 border-gold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Text
              </button>
              <button
                type="button"
                onClick={() => setDescMode('audio')}
                className={`flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${descMode === 'audio' ? 'bg-background text-foreground border-b-2 border-gold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Mic className="h-3.5 w-3.5" />
                Audio
              </button>
            </div>

            {/* Text panel */}
            {descMode === 'text' && (
              <Textarea
                id="description"
                placeholder="Describe your legal issue in detail..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-0 rounded-none focus-visible:ring-0 resize-none"
              />
            )}

            {/* Audio panel */}
            {descMode === 'audio' && (
              <div className="p-4 space-y-3">
                {audio.uploadState === 'done' && audioDescUrl ? (
                  <div className="flex items-center gap-3">
                    <audio src={audioDescUrl} controls className="h-9 flex-1 min-w-0" />
                    <button
                      type="button"
                      onClick={audio.clear}
                      className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                      title="Remove recording"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : audio.isRecording ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-destructive animate-pulse font-medium">
                      Recording… {fmt(audio.elapsed)} / 2:00
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={audio.stop}
                      className="gap-1.5"
                    >
                      <MicOff className="h-3.5 w-3.5" />
                      Stop
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {audio.uploadState === 'uploading'
                        ? 'Uploading recording…'
                        : 'Tap record to describe your issue verbally (max 2 min).'}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={audio.start}
                      disabled={audio.uploadState === 'uploading'}
                      className="gap-1.5 shrink-0"
                    >
                      <Mic className="h-3.5 w-3.5" />
                      Record
                    </Button>
                  </div>
                )}
                {audio.permissionDenied && (
                  <p className="text-xs text-destructive">
                    Microphone access denied. Allow mic in device settings, then try again.
                  </p>
                )}
                {audio.recorderError && !audio.permissionDenied && (
                  <p className="text-xs text-destructive">
                    Could not access microphone. Close other apps using the mic, then tap Record again.
                  </p>
                )}
                {audio.uploadState === 'error' && (
                  <p className="text-xs text-destructive">Upload failed. Try again.</p>
                )}
              </div>
            )}
          </div>

          {!hasDescription && (
            <p className="text-xs text-destructive">
              Provide a text or audio description.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Upload Documents (optional)</Label>
          <FileUpload
            onFilesChange={setFiles}
            onError={handleFileError}
            maxFiles={MAX_FILES}
            maxSizeMB={MAX_SIZE_MB}
          />
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => {
                  const next = e.target.checked;
                  if (next && !isAdmin && !isActive) {
                    setPaywallOpen(true);
                    return;
                  }
                  setIsEmergency(next);
                }}
                className="rounded"
              />
              Mark as Emergency
            </label>
            <p className="mt-1 text-xs text-muted-foreground">
              {isAdmin
                ? 'Emergency cases get priority handling in the queue.'
                : 'Only for Premium plan subscribers. Emergency cases get priority handling.'}
            </p>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={!isFormValid || isPending || audio.isRecording || audio.uploadState === 'uploading'}
        >
          {isPending ? 'Submitting...' : (submitLabel ?? 'Submit Query')}
        </Button>
      </form>

      {!isAdmin && (
        <PaywallModal
          open={paywallOpen}
          onOpenChange={setPaywallOpen}
          title="Emergency cases need a subscription"
          description="Upgrade to Premium to mark your query as an emergency and get priority handling."
          perks={[
            'Emergency queries get priority in the queue',
            'Faster advocate assignment when it matters',
            'Full Premium access across the platform',
          ]}
        />
      )}
    </div>
  );
};

export default CreateCase;
