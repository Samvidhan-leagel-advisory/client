import { CaseUnreadInboxList } from '@/components/case-chat/CaseUnreadInboxList';
import { path } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useCaseChatUnreadSummary } from '@/hooks/use-case-chat-unread';
import { AdminLayout } from '@/layouts/AdminLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import {
  invalidateCaseChatUnread,
  invalidateCaseMessagesForCase,
} from '@/lib/case-chat-queries';
import { queryClient } from '@/lib/query-client';
import type { CaseChatUnreadItem } from '@/types';
import { useLocation, useNavigate } from 'react-router-dom';

export default function CaseNotificationsPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = pathname.startsWith('/admin');

  const {
    data: unread,
    isPending,
    isFetching,
    refetch,
  } = useCaseChatUnreadSummary(user?.id);

  const Layout = isAdmin ? AdminLayout : DashboardLayout;

  const openCase = (row: CaseChatUnreadItem) => {
    invalidateCaseMessagesForCase(queryClient, row.caseId);
    invalidateCaseChatUnread(queryClient);
    const target = isAdmin
      ? path.adminCaseChat(row.caseId)
      : path.caseChat(row.caseId);
    navigate(target);
  };

  return (
    <Layout>
      <CaseUnreadInboxList
        items={unread?.items ?? []}
        totalUnread={unread?.totalUnread ?? 0}
        isLoading={isPending || isFetching}
        onRefresh={() => void refetch()}
        onOpenCase={openCase}
      />
    </Layout>
  );
}
