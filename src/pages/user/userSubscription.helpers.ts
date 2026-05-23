import type { SubscriptionCatalogPlan, SubscriptionPlan } from '@/types';

const STATUS_BADGE: Record<string, string> = {
  active: 'border-emerald-200/80 bg-emerald-50 text-emerald-800',
  authenticated: 'border-sky-200/80 bg-sky-50 text-sky-800',
  created: 'border-amber-200/80 bg-amber-50 text-amber-900',
  pending: 'border-amber-200/80 bg-amber-50 text-amber-900',
  halted: 'border-orange-200/80 bg-orange-50 text-orange-900',
  cancelled: 'border-border bg-muted text-muted-foreground',
  completed: 'border-border bg-muted text-muted-foreground',
  expired: 'border-border bg-muted text-muted-foreground',
};

export function formatInr(value: string | number): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(n)) return '—';
  return `₹${n.toLocaleString('en-IN')}`;
}

export function formatDateEnIn(iso: string | Date | null | undefined): string {
  if (iso == null) return '—';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function parseFeatureCsv(raw: string | undefined, max = 6): string[] {
  const s = raw ?? '';
  const parts = s.includes(';') ? s.split(';') : s.split(',');
  return parts
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, max);
}

/** Admin edit modal: catalog API row → UI plan (features as list, period normalized). */
export function catalogRowToModalSubscriptionPlan(
  row: SubscriptionCatalogPlan
): SubscriptionPlan {
  const raw = row.features ?? '';
  const features = raw
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  const cycle = String(row.billingCycle).toLowerCase();
  return {
    id: row.id,
    name: row.name,
    price: Number(row.priceInr),
    period: cycle === 'monthly' ? 'monthly' : 'yearly',
    features,
  };
}

export function sortPlansMonthlyFirst<T extends { billingCycle: string }>(plans: T[]): T[] {
  return [...plans].sort((a, b) => {
    if (a.billingCycle === b.billingCycle) return 0;
    return a.billingCycle === 'monthly' ? -1 : 1;
  });
}

export function razorpayStatusBadgeClass(status: string): string {
  return STATUS_BADGE[status] ?? 'border-border bg-muted text-muted-foreground';
}

export function shortenId(id: string, head = 14, tail = 6): string {
  if (id.length <= head + tail + 1) return id;
  return `${id.slice(0, head)}…${id.slice(-tail)}`;
}
