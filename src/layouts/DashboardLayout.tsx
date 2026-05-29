import { BrandLogo } from '@/components/BrandLogo';
import Breadcrumbs from '@/components/Breakcrumbs';
import {
  LAWYER_NAV,
  ROUTES,
  USER_NAV,
  isFullScreenCaseSubpage,
  type NavItem,
} from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useCaseChatUnreadSummary } from '@/hooks/use-case-chat-unread';
import { useSidebarScrollRestore } from '@/hooks/useSidebarScrollRestore';
import { getCookie, resetCookies, setCookie } from '@/lib/helpers';
import { isLawyerApprovedForPractice } from '@/lib/lawyer-access';
import { cn } from '@/lib/utils';
import {
  ArrowRightLeft,
  Loader2,
  LogOut,
  Menu,
  PanelLeft,
  PanelLeftClose,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, logout, isLoading } = useAuth();
  const { data: inboxUnread } = useCaseChatUnreadSummary(user?.id);
  const inboxCount = inboxUnread?.totalUnread ?? 0;

  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const navRef = useSidebarScrollRestore('dashboard');

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [user?.avatarUrl]);

  const showAvatar =
    Boolean(user?.avatarUrl && user.avatarUrl.length > 0) && !avatarLoadFailed;
  const activeRole = getCookie('x-active-role');

  const lawyerPendingNav: NavItem[] = [
    ROUTES.lawyer.profile,
    ROUTES.lawyer.documents,
  ]
    .map((to) => LAWYER_NAV.find((i) => i.to === to))
    .filter((item): item is NavItem => item != null);

  const nav =
    activeRole === 'lawyer'
      ? isLawyerApprovedForPractice(user)
        ? LAWYER_NAV
        : lawyerPendingNav
      : USER_NAV;
  const roleName = activeRole === 'lawyer' ? 'Advocate' : 'User';

  const hasMultipleRoles = user?.roles?.length > 1;
  const switchToText =
    activeRole === 'lawyer' ? 'Switch to User' : 'Switch to Lawyer';

  const handleLogout = async () => {
    await logout();
    resetCookies();
    navigate(ROUTES.login);
  };

  const isImmersiveCaseSubpage = isFullScreenCaseSubpage(location.pathname);

  const handleSwitchRole = () => {
    const newRole = activeRole === 'lawyer' ? 'user' : 'lawyer';
    setCookie('x-active-role', newRole);
    const target =
      newRole === 'lawyer' && !isLawyerApprovedForPractice(user)
        ? ROUTES.lawyer.profile
        : newRole === 'lawyer'
          ? ROUTES.lawyer.dashboard
          : ROUTES.user.dashboard;
    window.location.assign(target);
  };

  return (
    <div
      className={cn(
        'flex flex-col lg:flex-row',
        isImmersiveCaseSubpage
          ? 'h-[100dvh] max-h-[100dvh] min-h-0 overflow-hidden'
          : 'min-h-screen lg:h-[100dvh] lg:max-h-[100dvh] lg:min-h-0 lg:overflow-hidden'
      )}
    >
      {/* Mobile header */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between gap-2 border-b bg-card px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="shrink-0 rounded-md p-2 hover:bg-muted"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 flex-1 justify-center px-1">
          <BrandLogo
            as="link"
            to={nav[0].to}
            size="md"
            textVariant="headerCompact"
          />
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          aria-label="Open menu"
        >
          {showAvatar ? (
            <img
              src={user!.avatarUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="h-8 w-8 rounded-full object-cover"
              onError={() => setAvatarLoadFailed(true)}
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-bold text-primary-foreground">
              {user?.fullName?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </button>
      </header>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — sticky + collapsible */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 transform bg-navy transition-all duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'lg:w-16' : 'lg:w-64',
          'w-64'
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
                to={nav[0].to}
                size="md"
                textVariant="sidebar"
              />
            </div>
            <div
              className={cn(
                'hidden',
                collapsed && 'flex items-center justify-center lg:flex'
              )}
            >
              <BrandLogo as="link" to={nav[0].to} size="md" showText={false} />
            </div>
            <button
              className="p-1 text-primary-foreground/60 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Profile section in sidebar */}
          {!collapsed && (
            <div className="mx-4 mb-4 flex items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-2.5">
              {showAvatar ? (
                <img
                  src={user!.avatarUrl}
                  alt={user?.fullName ?? ''}
                  referrerPolicy="no-referrer"
                  className="h-9 w-9 rounded-full object-cover"
                  onError={() => setAvatarLoadFailed(true)}
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-sm font-bold text-gold">
                  {user?.fullName?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium text-gold">
                  {roleName} Panel
                </p>
                <p className="truncate text-sm font-semibold text-primary-foreground">
                  {user?.fullName}
                </p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto mb-4">
              {showAvatar ? (
                <img
                  src={user!.avatarUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="mx-auto h-9 w-9 rounded-full object-cover"
                  onError={() => setAvatarLoadFailed(true)}
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-sm font-bold text-gold">
                  {user?.fullName?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
          )}

          <nav
            ref={navRef}
            className={cn(
              'min-h-0 flex-1 space-y-0.5 overflow-y-auto',
              collapsed ? 'px-1.5' : 'px-3'
            )}
          >
            {nav.map((item) => {
              const active =
                location.pathname === item.to ||
                location.pathname.startsWith(item.to + '/');
              const isMessagesNav = item.to === ROUTES.user.notifications;
              const showInboxBadge = isMessagesNav && inboxCount > 0;
              const badgeLabel = inboxCount > 99 ? '99+' : String(inboxCount);
              return (
                <Link
                  key={item.to + item.label}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    collapsed && 'lg:justify-center lg:px-0 lg:py-2.5',
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

            {/* Role Switch - Only show if user has multiple roles */}
            {hasMultipleRoles && (
              <>
                {!collapsed && (
                  <div className="px-3 py-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-primary-foreground/40">
                      Switch Profile
                    </p>
                  </div>
                )}
                <button
                  onClick={handleSwitchRole}
                  title={collapsed ? switchToText : undefined}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    collapsed && 'lg:justify-center lg:px-0 lg:py-2.5',
                    'text-primary-foreground/60 hover:bg-sidebar-accent/50 hover:text-primary-foreground'
                  )}
                >
                  <ArrowRightLeft className="h-4 w-4 shrink-0" />
                  <span className={cn(collapsed && 'lg:hidden')}>
                    {switchToText}
                  </span>
                </button>
              </>
            )}
          </nav>

          {/* Collapse toggle — desktop only */}
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

      {/* Main content */}
      <main
        className={cn(
          'min-w-0 flex-1 lg:min-h-0',
          isImmersiveCaseSubpage
            ? 'flex min-h-0 flex-col overflow-hidden'
            : 'overflow-y-auto'
        )}
      >
        {isImmersiveCaseSubpage ? (
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
