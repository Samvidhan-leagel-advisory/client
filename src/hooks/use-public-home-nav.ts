import { ROUTES } from '@/constants';
import type { MouseEvent } from 'react';
import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/** Smooth-scroll a section into view by element id. No URL hash mutation. */
export function scrollToId(id: string, behavior: ScrollBehavior = 'smooth') {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior, block: 'start' });
}

/** Logo / Home + cross-page section jumps for marketing pages. */
export function usePublicHomeNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const isOnHome = location.pathname === ROUTES.home;

  const goHome = useCallback(
    (e?: MouseEvent) => {
      if (isOnHome) {
        e?.preventDefault();
        if (location.hash) {
          navigate({ pathname: ROUTES.home, hash: '' }, { replace: true });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      navigate(ROUTES.home);
    },
    [isOnHome, location.hash, navigate]
  );

  const onHomeLinkClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (isOnHome) goHome(e);
    },
    [goHome, isOnHome]
  );

  const scrollToSection = useCallback(
    (id: string, e?: MouseEvent) => {
      e?.preventDefault();
      if (isOnHome) {
        scrollToId(id);
        return;
      }
      navigate(ROUTES.home, { state: { scrollTo: id } });
    },
    [isOnHome, navigate]
  );

  return { isOnHome, goHome, onHomeLinkClick, scrollToSection };
}

/** Consume `location.state.scrollTo` set by cross-page section nav. */
export function useScrollToStateSection() {
  const location = useLocation();
  const navigate = useNavigate();
  const target = (location.state as { scrollTo?: string } | null)?.scrollTo;

  useEffect(() => {
    if (!target) return;
    const raf = window.requestAnimationFrame(() => {
      scrollToId(target);
      navigate(location.pathname, { replace: true, state: null });
    });
    return () => window.cancelAnimationFrame(raf);
  }, [target, location.pathname, navigate]);
}
