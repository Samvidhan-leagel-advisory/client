import { caseMessagesQueryKey } from '@/hooks/use-case-messages';
import { caseChatUnreadQueryKey } from '@/hooks/use-case-chat-unread';
import type { QueryClient } from '@tanstack/react-query';

export function invalidateCaseChatUnread(client: QueryClient) {
  void client.invalidateQueries({ queryKey: [...caseChatUnreadQueryKey] });
}

export function invalidateCaseMessagesForCase(client: QueryClient, caseId: string) {
  void client.invalidateQueries({ queryKey: caseMessagesQueryKey(caseId, 'user') });
  void client.invalidateQueries({ queryKey: caseMessagesQueryKey(caseId, 'admin') });
}
