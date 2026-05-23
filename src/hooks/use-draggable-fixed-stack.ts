import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';

export type FixedStackPos = { left: number; top: number };

const DRAG_THRESHOLD_PX = 8;

function clampStackPos(
  left: number,
  top: number,
  width: number,
  height: number,
  pad = 8
): FixedStackPos {
  const maxL = Math.max(pad, window.innerWidth - width - pad);
  const maxT = Math.max(pad, window.innerHeight - height - pad);
  return {
    left: Math.min(maxL, Math.max(pad, left)),
    top: Math.min(maxT, Math.max(pad, top)),
  };
}

function loadPos(key: string): FixedStackPos | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const p = JSON.parse(raw) as FixedStackPos;
    if (typeof p?.left === 'number' && typeof p?.top === 'number') return p;
  } catch {
    /* ignore */
  }
  return null;
}

function savePos(key: string, p: FixedStackPos) {
  try {
    localStorage.setItem(key, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

type DragSession = {
  pointerId: number;
  startX: number;
  startY: number;
  originLeft: number;
  originTop: number;
  dragging: boolean;
};

/**
 * Fixed stack (e.g. toast + FAB) anchored bottom-right by default; drag the FAB to reposition.
 * Small pointer movement still counts as a click; larger movement drags and suppresses the click.
 */
export function useDraggableFixedStack(options: {
  storageKey: string;
  /** CSS for the stack when no saved position (typically bottom / right + safe area). */
  defaultPositionStyle: CSSProperties;
}): {
  stackRef: RefObject<HTMLDivElement | null>;
  positionStyle: CSSProperties;
  inboxFabDragProps: {
    onPointerDown: (e: ReactPointerEvent<HTMLButtonElement>) => void;
    onPointerMove: (e: ReactPointerEvent<HTMLButtonElement>) => void;
    onPointerUp: (e: ReactPointerEvent<HTMLButtonElement>) => void;
    onPointerCancel: (e: ReactPointerEvent<HTMLButtonElement>) => void;
  };
  /** Call from the FAB `onClick` before navigating; returns true if the click should be ignored (after a drag). */
  consumeClickIfDragged: () => boolean;
} {
  const { storageKey, defaultPositionStyle } = options;
  const stackRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<FixedStackPos | null>(() => loadPos(storageKey));
  const sessionRef = useRef<DragSession | null>(null);
  const suppressClickRef = useRef(false);

  const persistPos = useCallback(
    (p: FixedStackPos) => {
      savePos(storageKey, p);
    },
    [storageKey]
  );

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return;
      const el = stackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const origin =
        pos ??
        ({
          left: rect.left,
          top: rect.top,
        } satisfies FixedStackPos);
      if (pos === null) {
        setPos(origin);
      }
      sessionRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        originLeft: origin.left,
        originTop: origin.top,
        dragging: false,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [pos]
  );

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLButtonElement>) => {
    const s = sessionRef.current;
    if (!s || e.pointerId !== s.pointerId) return;
    const el = stackRef.current;
    if (!el) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    if (!s.dragging) {
      if (dx * dx + dy * dy < DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) return;
      s.dragging = true;
    }
    const { width, height } = el.getBoundingClientRect();
    const next = clampStackPos(s.originLeft + dx, s.originTop + dy, width, height);
    setPos(next);
  }, []);

  const endPointer = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>) => {
      const s = sessionRef.current;
      if (!s || e.pointerId !== s.pointerId) return;
      sessionRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      if (s.dragging) {
        suppressClickRef.current = true;
        const el = stackRef.current;
        if (el) {
          const { left, top, width, height } = el.getBoundingClientRect();
          const p = clampStackPos(left, top, width, height);
          setPos(p);
          persistPos(p);
        }
      }
    },
    [persistPos]
  );

  const consumeClickIfDragged = useCallback(() => {
    if (!suppressClickRef.current) return false;
    suppressClickRef.current = false;
    return true;
  }, []);

  useLayoutEffect(() => {
    const onResize = () => {
      const el = stackRef.current;
      if (!el || pos === null) return;
      const { width, height } = el.getBoundingClientRect();
      const p = clampStackPos(pos.left, pos.top, width, height);
      if (p.left !== pos.left || p.top !== pos.top) {
        setPos(p);
        persistPos(p);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [pos, persistPos]);

  const positionStyle: CSSProperties =
    pos !== null
      ? {
          left: pos.left,
          top: pos.top,
          right: 'auto',
          bottom: 'auto',
        }
      : defaultPositionStyle;

  return {
    stackRef,
    positionStyle,
    inboxFabDragProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
    },
    consumeClickIfDragged,
  };
}
