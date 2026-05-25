import { BrandLogo } from '@/components/BrandLogo';
import Breadcrumbs from '@/components/Breakcrumbs';
import { ADMIN_NAV, ROUTES, isFullScreenCaseSubpage } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useCaseChatUnreadSummary } from '@/hooks/use-case-chat-unread';
import { useSidebarScrollRestore } from '@/hooks/useSidebarScrollRestore';
import { resetCookies } from '@/lib/helpers';
import { queryClient } from '@/lib/query-client';
import { cn } from '@/lib/utils';
import {
  Loader2,
  LogOut,
  Menu,
  PanelLeft,
  PanelLeftClose,
  RefreshCcw,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, isLoading } = useAuth();
  const { data: inboxUnread } = useCaseChatUnreadSummary(user?.id);
  const inboxCount = inboxUnread?.totalUnread ?? 0;
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const navRef = useSidebarScrollRestore('admin');

  const isFullScreen = isFullScreenCaseSubpage(location.pathname);

  const handleLogout = async () => {
    await logout();
    resetCookies();
    navigate(ROUTES.login);
  };

  const handleClearQueryCache = async () => {
    if (isClearingCache) return;
    setIsClearingCache(true);
    const started = performance.now();
    // Let React paint the spinner; clear() is synchronous otherwise.
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    queryClient.clear();

    const minSpinnerMs = 220;
    const remaining = minSpinnerMs - (performance.now() - started);
    if (remaining > 0) {
      await new Promise((r) => setTimeout(r, remaining));
    }
    window.location.reload();
    setIsClearingCache(false);
  };

  return (
    <div
      className={cn(
        'flex flex-col lg:flex-row',
        isFullScreen
          ? 'h-[100dvh] max-h-[100dvh] min-h-0 overflow-hidden'
          : 'min-h-screen lg:h-[100dvh] lg:max-h-[100dvh] lg:min-h-0 lg:overflow-hidden'
      )}
    >
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between gap-2 border-b bg-card px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="shrink-0 rounded-md p-2 hover:bg-muted"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-1">
          <BrandLogo
            as="link"
            to={ROUTES.admin.dashboard}
            size="sm"
            textVariant="headerCompact"
          />
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-primary-foreground">
          {user?.fullName?.charAt(0)?.toUpperCase() ?? 'A'}
        </div>
      </header>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 transform bg-navy transition-all duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'lg:w-16' : 'lg:w-60',
          'w-60'
        )}
      >
        <div className="flex h-full flex-col max-lg:pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          <div
            className={cn(
              'flex h-16 items-center px-5',
              collapsed ? 'lg:justify-center lg:px-0' : 'justify-between'
            )}
          >
            <div
              className={cn('min-w-0 flex-1 pr-2', collapsed && 'lg:hidden')}
            >
              <BrandLogo
                as="link"
                to={ROUTES.admin.dashboard}
                size="md"
                textVariant="sidebar"
              />
            </div>
            <div
              className={cn(
                'hidden',
                collapsed && 'flex items-center justify-center lg:flex'
              )}
              title="Samvidhan Legal Advisory · Admin panel"
            >
              <BrandLogo
                as="link"
                to={ROUTES.admin.dashboard}
                size="md"
                showText={false}
              />
            </div>
            <button
              className="p-1 text-primary-foreground/60 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {!collapsed && (
            <div className="mx-4 mb-3 px-0.5">
              <p className="text-xs font-medium uppercase tracking-wide text-gold">
                Admin panel
              </p>
            </div>
          )}

          <nav
            ref={navRef}
            className={cn(
              'min-h-0 flex-1 space-y-0.5 overflow-y-auto',
              collapsed ? 'mt-2 px-1.5' : 'px-3'
            )}
          >
            {ADMIN_NAV.map((item) => {
              const active =
                location.pathname === item.to ||
                location.pathname.startsWith(item.to + '/');
              const isMessagesNav = item.to === ROUTES.admin.notifications;
              const showInboxBadge = isMessagesNav && inboxCount > 0;
              const badgeLabel = inboxCount > 99 ? '99+' : String(inboxCount);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    collapsed && 'lg:justify-center lg:px-0',
                    active
                      ? 'bg-sidebar-accent text-primary-foreground'
                      : 'text-primary-foreground/60 hover:bg-sidebar-accent/50 hover:text-primary-foreground'
                  )}
                >
                  <span className="relative inline-flex shrink-0">
                    <item.icon className="h-4 w-4" />
                    {showInboxBadge ? (
                      <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-0.5 text-[9px] font-bold leading-none text-accent-foreground">
                        {badgeLabel}
                      </span>
                    ) : null}
                  </span>
                  <span className={cn(collapsed && 'lg:hidden')}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-sidebar-border p-3">
            <button
              type="button"
              disabled={isClearingCache}
              onClick={() => void handleClearQueryCache()}
              title={collapsed ? 'Clear cache' : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-foreground/60 hover:bg-sidebar-accent/50 hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-50',
                collapsed && 'lg:justify-center lg:px-0'
              )}
            >
              {isClearingCache ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4 shrink-0" />
              )}
              <span className={cn(collapsed && 'lg:hidden')}>
                {isClearingCache ? 'Clearing…' : 'Clear cache'}
              </span>
            </button>
          </div>

          <div className="hidden border-t border-sidebar-border p-2 lg:block">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-primary-foreground/60 hover:bg-sidebar-accent/50 hover:text-primary-foreground"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
              {!collapsed && <span>Collapse</span>}
            </button>
          </div>

          <div className="border-t border-sidebar-border p-3">
            <button
              onClick={handleLogout}
              title={collapsed ? 'Sign Out' : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-foreground/60 hover:bg-sidebar-accent/50 hover:text-primary-foreground',
                collapsed && 'lg:justify-center lg:px-0'
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4 shrink-0" />
              )}
              <span className={cn(collapsed && 'lg:hidden')}>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <main
        className={cn(
          'min-w-0 flex-1 lg:min-h-0',
          isFullScreen
            ? 'flex min-h-0 flex-col overflow-hidden'
            : 'overflow-y-auto'
        )}
      >
        {isFullScreen ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </div>
        ) : (
          <div
            className={cn(
              'p-4 md:p-6 lg:p-8',
              'max-lg:pb-[max(1.5rem,calc(1rem+env(safe-area-inset-bottom,0px)))]'
            )}
          >
            <div className="mb-2 hidden lg:block">
              <Breadcrumbs />
            </div>
            {children}
          </div>
        )}
      </main>
    </div>
  );
};
