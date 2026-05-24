import { AdminCaseLawyerAssign } from '@/components/admin/AdminCaseLawyerAssign';
import { CloseCaseDialog } from '@/components/case-detail/CloseCaseDialog';
import { CaseCodeText } from '@/components/CaseCodeText';
import { CaseDescriptionModal } from '@/components/CaseDescriptionModal';
import { CaseMeetingUri } from '@/components/CaseMeetingUri';
import { GenericTooltip } from '@/components/GenericTooltip';
import { CaseDetailSkeleton } from '@/components/skeletons/CaseDetailSkeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ActiveSubscriptionCard } from '@/components/user/ActiveSubscriptionCard';
import { SessionBookingModal } from '@/components/user/SessionBookingModal';
import { path } from '@/constants';
import { useAdminCaseDetails } from '@/hooks/useAdminCaseDetails';
import { useAdminCaseMutations } from '@/hooks/useAdminCaseMutations';
import { useUserActiveSubscription } from '@/hooks/useUserActiveSubscription';
import { AdminLayout } from '@/layouts/AdminLayout';
import {
  DESCRIPTION_PREVIEW_MAX_WORDS,
  splitWords,
  truncateToWords,
} from '@/lib/caseDescriptionPreview';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Gavel,
  Hash,
  Loader2,
  MessageCircle,
  RotateCcw,
  StickyNote,
  Tag,
  User,
  Video,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

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

const AdminCaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);
  const { data: caseData, isLoading } = useAdminCaseDetails(id);
  const [sessionBookingOpen, setSessionBookingOpen] = useState(false);
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

  const {
    updateCaseStatus,
    resetCase,
    isCaseActionPending,
    isUpdatingStatus,
    isResetting,
  } = useAdminCaseMutations(id, {
    caseLabel: caseData?.caseCode,
    additionalInvalidationKeys: [['case-requests']],
  });

  const handleCloseCase = async (_reason: string) => {
    try {
      await updateCaseStatus('closed');
      setCloseDialogOpen(false);
    } catch {
      // Error toast from useAdminCaseMutations
    }
  };

  const handleResetCase = async () => {
    await resetCase();
  };

  const handleAcceptCase = async () => {
    try {
      await updateCaseStatus('under_review');
    } catch {
      // Error toast from useAdminCaseMutations
    }
  };

  const priorityKey = (caseData?.priority ??
    'normal') as keyof typeof priorityConfig;
  const pConfig = priorityConfig[priorityKey] ?? priorityConfig.normal;

  const lawyerProfileId =
    caseData?.assignedLawyerId ?? caseData?.assignedLawyer?.id;
  const lawyerDisplayName = caseData?.assignedLawyer?.user?.fullName;
  const userId = caseData?.user?.id;
  const {
    subscription: userActiveSubscription,
    isCancelledAtPeriodEnd: userSubscriptionCancelling,
    isLoading: isUserSubscriptionLoading,
  } = useUserActiveSubscription(userId);
  const timelineUpdatedAt = caseData?.updatedAt ?? caseData?.createdAt;
  const isLawyerAssigned = caseData?.assignedLawyerId;

  const showCaseActions = ['lawyer_assigned', 'under_review'].includes(
    caseData?.status
  );
  const showBookSession =
    isLawyerAssigned &&
    !caseData?.caseSessionRequest &&
    ['lawyer_assigned', 'under_review'].includes(caseData?.status ?? '');

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <CaseDetailSkeleton isLawyer />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <TooltipProvider delayDuration={300}>
        <div className="flex min-h-0 flex-1 flex-col gap-6">
          {/* ── Page header card ── */}
          <Card className="overflow-hidden shadow-sm">
            <div className="bg-muted/40 px-6 py-5">
              {/* Title + badges */}
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

                {/* Action buttons */}
                {caseData?.status !== 'closed' &&
                  caseData?.status !== 'resolved' && (
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isCaseActionPending}
                            onClick={() => void handleResetCase()}
                          >
                            {isResetting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RotateCcw className="h-4 w-4" />
                            )}
                            Reset
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reset case to new</TooltipContent>
                      </Tooltip>

                      <Button
                        variant="outline"
                        size="sm"
                        className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={isCaseActionPending}
                        onClick={() => setCloseDialogOpen(true)}
                      >
                        <XCircle className="h-4 w-4" />
                        Close Case
                      </Button>

                      {caseData?.status === 'new' && (
                        <Button
                          variant="default"
                          size="sm"
                          disabled={isCaseActionPending}
                          onClick={() => void handleAcceptCase()}
                        >
                          {isUpdatingStatus ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Accept
                        </Button>
                      )}
                    </div>
                  )}
              </div>
            </div>

            <Separator />

            {/* Metadata strip */}
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
                {new Date(caseData?.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>

              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                Updated{' '}
                {new Date(timelineUpdatedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>

              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 shrink-0" />
                <span className="font-medium text-foreground">
                  {caseData?.user?.fullName ?? '—'}
                </span>
                {userId && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={path.adminUser(userId)}
                        className="text-primary transition-colors hover:text-primary/70"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>View user profile</TooltipContent>
                  </Tooltip>
                )}
              </span>

              {lawyerDisplayName && (
                <span className="flex items-center gap-1.5">
                  <Gavel className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium text-foreground">
                    Adv. {lawyerDisplayName}
                  </span>
                  {lawyerProfileId && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={path.adminLawyer(lawyerProfileId)}
                          className="text-primary transition-colors hover:text-primary/70"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>View lawyer profile</TooltipContent>
                    </Tooltip>
                  )}
                </span>
              )}
            </div>
          </Card>

          {/* ── Session / Meeting URI — full width ── */}
          {caseData?.caseSessionRequest && (
            <CaseMeetingUri
              sessionRequest={caseData?.caseSessionRequest}
              caseId={id}
              caseCode={caseData?.caseCode}
              allowAdminReviewSessionRequest
              allowAdminDeleteSessionRequest
            />
          )}

          {/* ── Main grid ── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left column */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              {/* Description */}
              <Card className="shadow-sm">
                <CardHeader className="border-b bg-muted/20 pb-4">
                  <CardTitle className="text-base font-semibold">
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 py-5">
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
                  ) : (
                    <p className="text-sm italic text-muted-foreground">
                      No description provided.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right sidebar — single unified card */}
            <div className="flex flex-col gap-5">
              <ActiveSubscriptionCard
                subscription={userActiveSubscription}
                isCancelledAtPeriodEnd={userSubscriptionCancelling}
                isLoading={isUserSubscriptionLoading}
              />
              <Card className="overflow-hidden shadow-sm">
                {/* Assign Lawyer section */}
                <div className="px-5 pb-4 pt-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Assigned Lawyer
                  </p>
                  <AdminCaseLawyerAssign
                    caseId={id}
                    caseStatus={caseData?.status}
                  />
                </div>

                {/* Case action links — always shown, conditional items hidden when irrelevant */}
                <Separator />
                <div className="px-5 pb-1 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Case Actions
                  </p>
                </div>

                {/* Documents — always visible */}
                <button
                  type="button"
                  onClick={() => navigate(path.adminCaseDocuments(id || ''))}
                  className="group flex w-full items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-sm font-medium">Documents</p>
                    <p className="text-xs text-muted-foreground">
                      View &amp; manage case files
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
                </button>

                {showCaseActions && (
                  <Link
                    to={id ? path.adminCaseChat(id) : '#'}
                    className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
                      <MessageCircle className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">Case Chat</p>
                      <p className="text-xs text-muted-foreground">
                        Message lawyer &amp; client
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                )}

                {showCaseActions && (
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
                        Admin &amp; lawyer - internal case notes
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                )}

                {showBookSession && (
                  <button
                    type="button"
                    onClick={() => setSessionBookingOpen(true)}
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

      <SessionBookingModal
        bookingOpen={sessionBookingOpen}
        setBookingOpen={setSessionBookingOpen}
        caseId={id}
        raisedBy="admin"
        lawyerName={caseData?.assignedLawyer?.user?.fullName}
      />

      <CaseDescriptionModal
        open={descriptionModalOpen}
        onOpenChange={setDescriptionModalOpen}
        caseTitle={caseData?.title ?? ''}
        description={rawDescription}
      />

      <CloseCaseDialog
        open={closeDialogOpen}
        onOpenChange={setCloseDialogOpen}
        caseCode={caseData?.caseCode}
        isConfirmPending={isUpdatingStatus}
        onConfirmClose={handleCloseCase}
      />
    </AdminLayout>
  );
};

export default AdminCaseDetail;
