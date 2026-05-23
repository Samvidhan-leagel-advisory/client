import { Skeleton } from '@/components/ui/skeleton';

const SidebarSkeleton = () => (
  <aside className="hidden w-64 bg-navy lg:flex lg:flex-col lg:sticky lg:top-0 lg:h-screen">
    {/* Logo */}
    <div className="flex h-16 items-center gap-2.5 px-5">
      <Skeleton className="h-5 w-5 rounded bg-white/10" />
      <Skeleton className="h-5 w-24 rounded bg-white/10" />
    </div>

    {/* Profile card */}
    <div className="mx-4 mb-4 flex items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-2.5">
      <Skeleton className="h-9 w-9 shrink-0 rounded-full bg-white/10" />
      <div className="min-w-0 space-y-1.5">
        <Skeleton className="h-3 w-16 rounded bg-white/10" />
        <Skeleton className="h-4 w-28 rounded bg-white/10" />
      </div>
    </div>

    {/* Nav items */}
    <nav className="flex-1 space-y-1 px-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <Skeleton className="h-4 w-4 shrink-0 rounded bg-white/10" />
          <Skeleton className={`h-4 rounded bg-white/10 ${i % 2 === 0 ? 'w-24' : 'w-20'}`} />
        </div>
      ))}
    </nav>

    {/* Logout */}
    <div className="border-t border-sidebar-border p-3">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <Skeleton className="h-4 w-4 shrink-0 rounded bg-white/10" />
        <Skeleton className="h-4 w-16 rounded bg-white/10" />
      </div>
    </div>
  </aside>
);

const ContentSkeleton = () => (
  <div className="space-y-8 p-4 md:p-6 lg:p-8">
    {/* Title + subtitle */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-72" />
    </div>

    {/* Stat cards */}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
          </div>
          <Skeleton className="mt-3 h-8 w-16" />
        </div>
      ))}
    </div>

    {/* Section heading */}
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Case cards */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-4 w-48" />
          <Skeleton className="mt-1.5 h-3 w-32" />
        </div>
      ))}
    </div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="flex min-h-screen flex-col lg:flex-row">
    <SidebarSkeleton />
    <main className="min-h-screen flex-1">
      {/* Top bar */}
      <div className="hidden h-14 items-center border-b bg-card px-6 lg:flex">
        <Skeleton className="h-4 w-28" />
      </div>
      <ContentSkeleton />
    </main>
  </div>
);

export default DashboardSkeleton;
