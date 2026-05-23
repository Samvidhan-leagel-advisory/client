import { createCase, uploadAsset } from '@/api-client';
import { FileUpload } from '@/components/FileUpload';
import PaywallModal from '@/components/PaywallModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import WithShimmer from '@/components/WithShimmer';
import { ROUTES } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import { useActiveSubscription } from '@/hooks/useActiveSubscription';
import { useCategories } from '@/hooks/useCategories';
import { DashboardLayout } from '@/layouts/DashboardLayout';
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
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const NewCase = () => {
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { isActive } = useActiveSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useCategories();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      const documents = files.length > 0 ? await uploadFiles(files) : [];
      const payload = {
        practiceAreaId: categoryId,
        title: title.trim(),
        description: description.trim(),
        isEmergency,
        documents,
      };
      return await createCase(payload);
    },
    onSuccess: () => {
      toast({
        title: 'Case submitted',
        description:
          'Your legal query has been filed. We will assign a lawyer shortly.',
      });
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
    await queryClient.invalidateQueries({ queryKey: ['user-cases'] });
    navigate(ROUTES.user.cases);
  };

  const handleFileError = (message: string) => {
    toast({
      title: 'File upload error',
      description: message,
      variant: 'destructive',
    });
  };

  const isFormValid = categoryId && title.trim() && description.trim();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Raise a Legal Query</h1>
          <p className="mt-1 text-muted-foreground">
            Describe your legal issue and we'll connect you with the right
            advocate.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Category</Label>
            {categoriesLoading && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CATEGORY_SKELETON_WIDTHS.map((w, i) => (
                  <div
                    key={i}
                    className="rounded-lg border bg-card px-3 py-2.5"
                  >
                    <WithShimmer loading className={`h-4 ${w} rounded`} />
                  </div>
                ))}
              </div>
            )}
            {categoriesError && (
              <p className="text-sm text-destructive">
                Failed to load categories.
              </p>
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
                {title.length}/{CASE_TITLE_MAX_LENGTH}
              </span>
            </div>
            <Input
              id="title"
              placeholder="e.g. Property ownership dispute"
              value={title}
              maxLength={CASE_TITLE_MAX_LENGTH}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              One line is enough. Put facts and background in detailed
              description below (max {CASE_TITLE_MAX_LENGTH} characters).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your legal issue in detail..."
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
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
                    if (next && !isActive) {
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
                Only for Premium plan subscribers. Emergency cases get priority
                handling.
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!isFormValid || isPending}
          >
            {isPending ? 'Submitting...' : 'Submit Query'}
          </Button>
        </form>

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
      </div>
    </DashboardLayout>
  );
};

export default NewCase;
