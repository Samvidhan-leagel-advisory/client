import { getCaseDetails } from '@/api-client';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { AdminCaseInternalNotesContent } from '@/components/case-detail/AdminCaseInternalNotesContent';
import { GenericTooltip } from '@/components/GenericTooltip';
import { LawyerApprovedGate } from '@/components/LawyerApprovedGate';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CaseDetailSkeleton } from '@/components/skeletons/CaseDetailSkeleton';
import { Button } from '@/components/ui/button';
import { ROUTES, path } from '@/constants';
import { useAdminCaseDetails } from '@/hooks/useAdminCaseDetails';
import { AdminLayout } from '@/layouts/AdminLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { getCookie } from '@/lib/helpers';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';

function CaseInternalNotesInner() {
  const { id } = useParams();
  const activeRole = getCookie('x-active-role');
  const isAdmin = activeRole === 'admin';

  const { data: adminCaseData, isLoading: adminLoading } = useAdminCaseDetails(
    id,
    { enabled: isAdmin }
  );
  const { data: lawyerCaseData, isLoading: lawyerLoading } = useQuery({
    queryKey: ['case-details', id],
    queryFn: async () => {
      const response = await getCaseDetails(id);
      return response.data;
    },
    enabled: !isAdmin && Boolean(id),
    refetchOnWindowFocus: false,
  });

  const isLoading = isAdmin ? adminLoading : lawyerLoading;
  const Layout = isAdmin ? AdminLayout : DashboardLayout;
  const backLink = isAdmin
    ? path.adminCase(id || '')
    : path.caseDetail(id || '');

  const tooltipContent = isAdmin
    ? 'Admin and lawyer — internal case notes'
    : 'Private notes visible only to lawyers and admins.';

  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-0 flex-1 flex-col gap-4 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-4 md:px-6 md:pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] md:pt-6">
          <CaseDetailSkeleton isLawyer={!isAdmin} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center gap-2 border-b border-border bg-card py-2 pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] md:gap-3 md:px-6 md:py-3">
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
            content={tooltipContent}
            side="bottom"
            className="min-w-0 flex-1"
          >
            <p className="truncate text-sm font-semibold leading-none text-foreground">
              Internal Notes
            </p>
          </GenericTooltip>
        </div>

        <div className="flex min-h-0 flex-1 flex-col pt-4 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pb-[calc(1rem+env(safe-area-inset-bottom,0px))] md:px-6 md:pt-6 md:pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
          <AdminCaseInternalNotesContent
            notesVariant={isAdmin ? 'admin' : 'lawyer'}
            caseStatus={
              isAdmin ? adminCaseData?.status : lawyerCaseData?.status
            }
            caseCode={
              isAdmin ? adminCaseData?.caseCode : lawyerCaseData?.caseCode
            }
          />
        </div>
      </div>
    </Layout>
  );
}

/** Shared `/cases/:id/internal-notes` — AdminLayout + admin APIs or DashboardLayout + lawyer APIs. */
export default function CaseInternalNotesPage() {
  const activeRole = getCookie('x-active-role');

  if (activeRole === 'admin') {
    return (
      <AdminProtectedRoute>
        <CaseInternalNotesInner />
      </AdminProtectedRoute>
    );
  }

  if (activeRole === 'lawyer') {
    return (
      <ProtectedRoute allowedRoles={['lawyer']}>
        <LawyerApprovedGate>
          <CaseInternalNotesInner />
        </LawyerApprovedGate>
      </ProtectedRoute>
    );
  }

  return <Navigate to={ROUTES.login} replace />;
}
