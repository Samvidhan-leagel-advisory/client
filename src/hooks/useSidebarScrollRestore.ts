import { getCookie, setCookie } from '@/lib/helpers';
import { useLayoutEffect, useRef } from 'react';

export const SIDEBAR_SCROLL_COOKIE_PREFIX = 'sidebar-nav-scroll';

export function useSidebarScrollRestore(key: string) {
  const navRef = useRef<HTMLElement>(null);
  const cookieName = `${SIDEBAR_SCROLL_COOKIE_PREFIX}-${key}`;

  useLayoutEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const saved = getCookie(cookieName);
    if (saved) {
      el.scrollTop = Number(saved);
    }

    const handleScroll = () => {
      setCookie(cookieName, String(el.scrollTop));
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [cookieName]);

  return navRef;
}
