import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

const DEFAULT_NEAR_TOP_PX = 72;
const DEFAULT_FROM_BOTTOM_PX = 120;

export type UseChatThreadScrollLoadOlder = {
  isLoading: boolean;
  onLoadOlder: () => void;
  /** `scrollTop` below this triggers `onLoadOlder`. Default 72. */
  nearTopPx?: number;
};

export function useChatThreadScroll(options: {
  isLoadingOlder: boolean;
  isLoadingMessages: boolean;
  messagesLength: number;
  newestMessageId: string | undefined;
  isSending: boolean;
  loadOlder?: UseChatThreadScrollLoadOlder | null;
  /** Distance from bottom (px) above which the “scroll to bottom” control is shown. */
  fromBottomThresholdPx?: number;
}) {
  const {
    isLoadingOlder,
    isLoadingMessages,
    messagesLength,
    newestMessageId,
    isSending,
    loadOlder,
    fromBottomThresholdPx = DEFAULT_FROM_BOTTOM_PX,
  } = options;

  const scrollRef = useRef<HTMLDivElement>(null);
  const preLoadHeightRef = useRef<number | null>(null);
  const loadOlderLock = useRef(false);

  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  useLayoutEffect(() => {
    if (isLoadingOlder) {
      preLoadHeightRef.current = scrollRef.current?.scrollHeight ?? null;
    } else if (preLoadHeightRef.current != null && scrollRef.current) {
      const el = scrollRef.current;
      const prev = preLoadHeightRef.current;
      preLoadHeightRef.current = null;
      el.scrollTop = el.scrollHeight - prev + el.scrollTop;
    }
  }, [isLoadingOlder, messagesLength]);

  useEffect(() => {
    if (!isLoadingOlder) loadOlderLock.current = false;
  }, [isLoadingOlder]);

  useLayoutEffect(() => {
    if (isLoadingOlder || isLoadingMessages) return;
    const el = scrollRef.current;
    if (!el) return;
    if (!newestMessageId && !isSending) return;
    el.scrollTop = el.scrollHeight;
    setShowScrollToBottom(false);
  }, [newestMessageId, isSending, isLoadingOlder, isLoadingMessages]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollToBottom(gap > fromBottomThresholdPx);

    const lo = loadOlder;
    if (!lo || lo.isLoading || loadOlderLock.current) return;
    const nearTop = lo.nearTopPx ?? DEFAULT_NEAR_TOP_PX;
    if (el.scrollTop < nearTop) {
      loadOlderLock.current = true;
      lo.onLoadOlder();
    }
  }, [loadOlder, fromBottomThresholdPx]);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    setShowScrollToBottom(false);
  }, []);

  /** Call before a manual “load older” action so scroll doesn’t double-trigger. */
  const lockLoadOlder = useCallback(() => {
    loadOlderLock.current = true;
  }, []);

  return {
    scrollRef,
    onScroll,
    scrollToBottom,
    showScrollToBottom,
    lockLoadOlder,
  };
}
