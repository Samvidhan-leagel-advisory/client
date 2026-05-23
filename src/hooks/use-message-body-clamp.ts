import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/** Clamp message body to ~6 lines and detect overflow for WhatsApp-style “Read more”. */
export function useMessageBodyClamp(text: string) {
  const [expanded, setExpanded] = useState(false);
  const [canToggle, setCanToggle] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setExpanded(false);
  }, [text]);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    if (expanded) {
      setCanToggle(true);
      return;
    }
    setCanToggle(el.scrollHeight > el.clientHeight + 1);
  }, [text, expanded]);

  const toggleExpanded = useCallback(() => {
    setExpanded((v) => !v);
  }, []);

  return {
    textRef,
    expanded,
    toggleExpanded,
    canToggle,
    lineClampClassName: expanded ? undefined : 'line-clamp-6',
  };
}
