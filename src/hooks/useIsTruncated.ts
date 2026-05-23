import { useCallback, useEffect, useRef, useState } from 'react';

export function useIsTruncated<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const check = useCallback(() => {
    const el = ref.current;
    if (el) {
      setIsTruncated(el.scrollHeight > el.clientHeight);
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    check();

    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [check]);

  return { ref, isTruncated };
}
