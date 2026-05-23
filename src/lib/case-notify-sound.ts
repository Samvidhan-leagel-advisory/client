let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    if (!sharedCtx || sharedCtx.state === 'closed') sharedCtx = new Ctx();
    return sharedCtx;
  } catch {
    return null;
  }
}

/** Short two-tone chime for new case messages (no asset file). */
export async function playCaseMessageChime(): Promise<void> {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') await ctx.resume();
  } catch {
    return;
  }

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(0.14, now + 0.015);
  master.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
  master.connect(ctx.destination);

  const tone = (freq: number, start: number, duration: number) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.35, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.01, start + duration);
    osc.connect(g);
    g.connect(master);
    osc.start(start);
    osc.stop(start + duration + 0.04);
  };

  tone(784, now, 0.11);
  tone(1047, now + 0.09, 0.14);
}
