import { assignAdminCaseLawyer } from '@/api-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAdminAssignableLawyers } from '@/hooks/useAdminAssignableLawyers';
import {
  adminCaseDetailsQueryKey,
  useAdminCaseDetails,
} from '@/hooks/useAdminCaseDetails';
import { queryClient } from '@/lib/query-client';
import { getApiErrorMessage } from '@/lib/utils';
import type { CaseStatus, LawyerListItem } from '@/types';
import { LEGAL_CATEGORIES } from '@/types';
import { useMutation } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Loader2,
  Search,
} from 'lucide-react';
import { useEffect, useState } from 'react';

function initials(name: string) {
  const p = name.split(/\s+/).filter(Boolean).slice(0, 2);
  return p.map((w) => w[0]?.toUpperCase() ?? '').join('') || '?';
}

function imgUrl(u?: string | null) {
  const s = u?.trim();
  return s?.startsWith('http') || s?.startsWith('/') || s?.startsWith('data:')
    ? s
    : null;
}

function areasLine(lawyer: LawyerListItem) {
  const parts = lawyer.lawyerPracticeAreas
    .map((row) => {
      const k = row.practiceArea?.name as
        | keyof typeof LEGAL_CATEGORIES
        | undefined;
      return (k && LEGAL_CATEGORIES[k]) || row.practiceArea?.name;
    })
    .filter(Boolean) as string[];
  return parts.length ? parts.join(' · ') : undefined;
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <div className="space-y-1 py-1">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-2 px-2 py-1.5">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-[60%]" />
            <Skeleton className="h-2.5 w-[85%]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminCaseLawyerAssign({
  caseId,
  caseStatus,
}: {
  caseStatus: CaseStatus;
  caseId: string | undefined;
}) {
  const locked = caseStatus === 'resolved' || caseStatus === 'closed';
  const { toast } = useToast();
  const { data: c } = useAdminCaseDetails(caseId);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const {
    lawyers,
    totalPages,
    isFetching,
    isLoading,
    search,
    setSearch,
    page,
    setPage,
  } = useAdminAssignableLawyers(open);

  const currentLawyerId = c?.assignedLawyerId ?? c?.assignedLawyer?.id ?? '';

  useEffect(() => {
    setSelectedId(currentLawyerId);
  }, [currentLawyerId]);

  useEffect(() => {
    if (locked) {
      setOpen(false);
    }
  }, [locked]);

  const assignMutation = useMutation({
    mutationFn: () => assignAdminCaseLawyer(caseId, selectedId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminCaseDetailsQueryKey(caseId),
      });
      queryClient.invalidateQueries({ queryKey: ['admin-cases'] });
      toast({ title: 'Lawyer assigned' });
    },
    onError: (err) => {
      toast({
        title: 'Assign failed',
        description: getApiErrorMessage(err),
        variant: 'destructive',
      });
    },
  });

  const row = lawyers.find((l) => l.id === selectedId);
  const label =
    row?.user.fullName ??
    (selectedId && selectedId === currentLawyerId
      ? c?.assignedLawyer?.user?.fullName
      : null) ??
    (selectedId ? 'Selected lawyer' : null);
  const avatarSrc =
    imgUrl(row?.user.avatarUrl) ??
    (selectedId === currentLawyerId
      ? imgUrl(c?.assignedLawyer?.user?.avatarUrl)
      : null);

  const listBody = isLoading ? (
    <SkeletonRows count={5} />
  ) : lawyers.length === 0 ? (
    isFetching ? (
      <SkeletonRows count={4} />
    ) : (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No lawyers found.
      </p>
    )
  ) : (
    <div className={`p-1 ${isFetching && !isLoading ? 'opacity-50' : ''}`}>
      {lawyers.map((lawyer) => {
        const sub = areasLine(lawyer);
        const sel = selectedId === lawyer.id;
        const src = imgUrl(lawyer.user.avatarUrl);
        return (
          <button
            key={lawyer.id}
            type="button"
            onClick={() => {
              setSelectedId(lawyer.id);
              setOpen(false);
            }}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/70 ${sel ? 'bg-muted' : ''}`}
          >
            <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border/80">
              {src && <AvatarImage src={src} alt="" className="object-cover" />}
              <AvatarFallback className="bg-muted text-[11px] font-semibold text-foreground">
                {initials(lawyer.user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{lawyer.user.fullName}</p>
              {sub && (
                <p className="truncate text-[11px] text-muted-foreground">
                  {sub}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div
      className={`flex w-full min-w-0 items-stretch gap-2 ${locked ? 'opacity-60' : ''}`}
      aria-disabled={locked}
    >
      <Popover
        open={locked ? false : open}
        onOpenChange={(next) => {
          if (!locked) {
            setOpen(next);
          }
        }}
      >
        <div className="min-w-0 flex-1">
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={locked ? false : open}
              disabled={locked}
              className="h-10 w-full min-w-0 justify-start gap-2.5 px-3 font-normal hover:bg-muted/60 hover:text-foreground data-[state=open]:bg-muted/50 [&_svg[data-chevron]]:ml-auto [&_svg[data-chevron]]:shrink-0"
            >
              <Avatar className="h-8 w-8 shrink-0 ring-1 ring-border/80">
                {avatarSrc && (
                  <AvatarImage
                    src={avatarSrc}
                    alt=""
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="bg-muted text-[11px] font-semibold text-foreground">
                  {label ? initials(label) : '…'}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate text-left">
                {label ?? 'Search lawyers…'}
              </span>
              <ChevronsUpDown data-chevron className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-1.5rem)] p-0"
          align="start"
        >
          <div className="border-b p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name…"
                className="h-9 pl-8 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-[min(50vh,260px)] overflow-y-auto">
            {listBody}
          </div>
          {totalPages > 1 ? (
            <div className="flex items-center justify-between border-t px-2 py-1.5 text-xs text-muted-foreground">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span>
                {page} / {totalPages}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
      <Button
        type="button"
        disabled={locked || !caseId || !selectedId || assignMutation.isPending}
        size="sm"
        className="h-10 w-[20%] min-w-0 flex-none px-4 text-xs font-medium sm:max-w-[11rem] sm:flex-none"
        onClick={() => assignMutation.mutate()}
      >
        {assignMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : currentLawyerId ? (
          'Reassign'
        ) : (
          'Assign'
        )}
      </Button>
    </div>
  );
}
