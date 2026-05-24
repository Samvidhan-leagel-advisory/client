import { getCaseDetails } from '@/api-client';
import { CaseCodeText } from '@/components/CaseCodeText';
import { CaseDescriptionModal } from '@/components/CaseDescriptionModal';
import { CaseMeetingUri } from '@/components/CaseMeetingUri';
import { GenericTooltip } from '@/components/GenericTooltip';
import { CaseDetailSkeleton } from '@/components/skeletons/CaseDetailSkeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SessionBookingModal } from '@/components/user/SessionBookingModal';
import { path } from '@/constants';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import {
  DESCRIPTION_PREVIEW_MAX_WORDS,
  splitWords,
  truncateToWords,
} from '@/lib/caseDescriptionPreview';
import { getCookie } from '@/lib/helpers';
import { useQuery } from '@tanstack/react-query';
import { AudioDescriptionPlayer } from '@/components/AudioDescriptionPlayer';
import {
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  Clock,
  FileText,
  Gavel,
  Hash,
  MessageCircle,
  StickyNote,
  Tag,
  User,
  Video,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const priorityConfig = {
  urgent: {
    color: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: AlertTriangle,
  },
  high: {
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    icon: AlertTriangle,
  },
  normal: {
    color: 'bg-muted text-muted-foreground border-border',
    icon: null,
  },
  low: { color: 'bg-muted text-muted-foreground border-border', icon: null },
};

const CaseDetail = () => {
  const { id } = useParams();
  const activeRole = getCookie('x-active-role');
  const isLawyer = activeRole === 'lawyer' ? true : false;
  const [bookingOpen, setBookingOpen] = useState(false);
  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);

  const { data: caseData, isLoading } = useQuery({
    queryKey: ['case-details', id],
    queryFn: async () => {
      const response = await getCaseDetails(id);
      return response.data;
    },
    refetchOnWindowFocus: false,
  });

  const rawDescription = caseData?.description?.trim() ?? '';
  const descriptionIsLong = useMemo(() => {
    if (!rawDescription) return false;
    return splitWords(rawDescription).length > DESCRIPTION_PREVIEW_MAX_WORDS;
  }, [rawDescription]);

  const descriptionPreviewText = useMemo(
    () =>
      rawDescription
        ? truncateToWords(rawDescription, DESCRIPTION_PREVIEW_MAX_WORDS)
        : '',
    [rawDescription]
  );

  const isLawyerAssigned = caseData?.assignedLawyerId;
  const timelineUpdatedAt = caseData?.updatedAt ?? caseData?.createdAt;

  const priorityKey = (caseData?.priority ??
    'normal') as keyof typeof priorityConfig;
  const pConfig = priorityConfig[priorityKey] ?? priorityConfig.normal;

  const showCaseActions = ['lawyer_assigned', 'under_review'].includes(
    caseData?.status ?? ''
  );
  const showBookSession =
    isLawyerAssigned && !caseData?.caseSessionRequest && !isLawyer;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6">
          <CaseDetailSkeleton isLawyer={isLawyer} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <TooltipProvider delayDuration={300}>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6">
          {/* ── Page header card ── */}
          <Card className="overflow-hidden shadow-sm">
            <div className="bg-muted/40 px-6 py-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-2.5">
                  <GenericTooltip
                    content={caseData?.title}
                    side="bottom"
                    className="min-w-0"
                  >
                    <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
                      {caseData?.title}
                    </h1>
                  </GenericTooltip>

                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={caseData?.status} />
                    {caseData?.isEmergency && (
                      <Badge
                        variant="outline"
                        className="border-destructive/30 bg-destructive/10 text-destructive"
                      >
                        Urgent
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={`gap-1 ${pConfig.color}`}
                    >
                      {pConfig.icon && <pConfig.icon className="h-3 w-3" />}
                      {(caseData?.priority ?? 'normal').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 shrink-0" />
                <CaseCodeText className="font-medium text-foreground">
                  {caseData?.caseCode}
                </CaseCodeText>
              </span>

              <span className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 shrink-0" />
                <span className="text-foreground">
                  {caseData?.practiceArea?.name}
                </span>
              </span>

              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                Created{' '}
                {caseData?.createdAt &&
                  new Date(caseData.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
              </span>

              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                Updated{' '}
                {timelineUpdatedAt &&
                  new Date(timelineUpdatedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
              </span>

              {isLawyer && (
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium text-foreground">
                    {caseData?.user?.fullName ?? '—'}
                  </span>
                </span>
              )}

              {caseData?.assignedLawyer?.user?.fullName && (
                <span className="flex items-center gap-1.5">
                  <Gavel className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium text-foreground">
                    Adv. {caseData.assignedLawyer.user.fullName}
                  </span>
                </span>
              )}
            </div>
          </Card>

          {caseData?.caseSessionRequest && (
            <CaseMeetingUri
              sessionRequest={caseData?.caseSessionRequest}
              caseId={id}
              caseCode={caseData?.caseCode}
              allowWithdrawSessionRequest={!isLawyer}
            />
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-2">
              <Card className="shadow-sm">
                <CardHeader className="border-b bg-muted/20 pb-4">
                  <CardTitle className="text-base font-semibold">
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 py-5 space-y-4">
                  {rawDescription ? (
                    descriptionIsLong ? (
                      <div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                          {descriptionPreviewText}
                        </p>
                        <button
                          type="button"
                          className="mt-4 text-xs font-medium text-primary transition-colors hover:text-primary/70"
                          onClick={() => setDescriptionModalOpen(true)}
                        >
                          Read full description →
                        </button>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                        {rawDescription}
                      </p>
                    )
                  ) : !caseData?.audioDescUrl ? (
                    <p className="text-sm italic text-muted-foreground">
                      No description provided.
                    </p>
                  ) : null}

                  {caseData?.audioDescUrl && (
                    <AudioDescriptionPlayer src={caseData.audioDescUrl} />
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col gap-5">
              <Card className="overflow-hidden shadow-sm">
                <div className="px-5 pb-1 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Case Actions
                  </p>
                </div>

                <Link
                  to={id ? path.caseDocuments(id) : '#'}
                  className="group flex w-full items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-sm font-medium">Documents</p>
                    <p className="text-xs text-muted-foreground">
                      View &amp; upload case files
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
                </Link>

                {showCaseActions && (
                  <Link
                    to={id ? path.caseChat(id) : '#'}
                    className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
                      <MessageCircle className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">Case Chat</p>
                      <p className="text-xs text-muted-foreground">
                        Message about this case
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                )}

                {showCaseActions && isLawyer && (
                  <Link
                    to={id ? path.caseInternalNotes(id) : '#'}
                    className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                      <StickyNote className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">Internal Notes</p>
                      <p className="text-xs text-muted-foreground">
                        Lawyer &amp; admin only
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                )}

                {showBookSession && (
                  <button
                    type="button"
                    onClick={() => setBookingOpen(true)}
                    className="group flex w-full items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
                      <Video className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-sm font-medium">Book Session</p>
                      <p className="text-xs text-muted-foreground">
                        Schedule a video consultation
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
                  </button>
                )}

                <div className="pb-2" />
              </Card>
            </div>
          </div>
        </div>
      </TooltipProvider>

      <CaseDescriptionModal
        open={descriptionModalOpen}
        onOpenChange={setDescriptionModalOpen}
        caseTitle={caseData?.title ?? ''}
        description={rawDescription}
      />

      <SessionBookingModal
        bookingOpen={bookingOpen}
        setBookingOpen={setBookingOpen}
        caseId={id}
        lawyerName={caseData?.assignedLawyer?.user?.fullName}
      />
    </DashboardLayout>
  );
};

export default CaseDetail;
