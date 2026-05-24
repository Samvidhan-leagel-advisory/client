import { differenceInSeconds } from 'date-fns';
import { useEffect, useState } from 'react';

export type CountdownRemaining = {
  d: number;
  h: number;
  m: number;
  s: number;
} | null;

function computeRemaining(target: Date): CountdownRemaining {
  const totalSeconds = differenceInSeconds(target, new Date());
  if (totalSeconds <= 0) return null;
  return {
    d: Math.floor(totalSeconds / 86400),
    h: Math.floor((totalSeconds % 86400) / 3600),
    m: Math.floor((totalSeconds % 3600) / 60),
    s: totalSeconds % 60,
  };
}

export function useCountdown(target: Date | null): CountdownRemaining {
  const [remaining, setRemaining] = useState<CountdownRemaining>(() =>
    target ? computeRemaining(target) : null
  );

  useEffect(() => {
    if (!target) {
      setRemaining(null);
      return;
    }
    setRemaining(computeRemaining(target));
    const id = setInterval(() => setRemaining(computeRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return remaining;
}
