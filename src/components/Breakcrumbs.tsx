import { PATH_PREFIX, ROUTES } from '@/constants';
import { getCookie } from '@/lib/helpers';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';

/** First path segment to skip — matches `PATH_PREFIX` (`/lawyer`, `/admin`). User routes have no prefix. */
const ROLE_PREFIX_SEGMENTS = new Set(
  Object.values(PATH_PREFIX).map((p) => p.slice(1))
);

interface BreadcrumbItem {
  label: string;
  to?: string;
}

const ROUTE_LABELS: Record<string, string> = {
  lawyer: 'Dashboard',
  admin: 'Dashboard',
  dashboard: 'Dashboard',
  cases: 'Cases',
  'new-case': 'New Case',
  lawyers: 'Our Lawyers',
  sessions: 'Sessions',
  subscription: 'Subscription',
  profile: 'Profile',
  documents: 'Documents',
  users: 'Users',
  payments: 'Payments',
  // settings: 'Settings',
  subscriptions: 'Subscriptions',
  'case-requests': 'Case Requests',
  'session-requests': 'Session Requests',
  'lawyer-pending-documents': 'Pending documents',
  'lawyer-verifications': 'Verifications',
  notifications: 'Messages',
};

function dashboardHref(pathname: string, activeRole: string | undefined) {
  if (pathname.startsWith(PATH_PREFIX.admin)) return ROUTES.admin.dashboard;
  if (pathname.startsWith(PATH_PREFIX.lawyer)) return ROUTES.lawyer.dashboard;
  return activeRole === 'lawyer'
    ? ROUTES.lawyer.dashboard
    : ROUTES.user.dashboard;
}

function casesListHref(pathname: string, activeRole: string | undefined) {
  if (pathname.startsWith(PATH_PREFIX.admin)) return ROUTES.admin.cases;
  if (pathname.startsWith(PATH_PREFIX.lawyer) || activeRole === 'lawyer')
    return ROUTES.lawyer.cases;
  return ROUTES.user.cases;
}

function paramSet(params: Record<string, string | undefined>) {
  return new Set(Object.values(params).filter((v): v is string => Boolean(v)));
}

function segmentLabel(
  seg: string,
  i: number,
  segments: string[],
  params: Set<string>,
  pathname: string
) {
  if (params.has(seg)) return seg;
  const next = segments[i + 1];
  if (seg === 'cases' && next && params.has(next)) return 'Case';
  if (seg === 'lawyers' && pathname.includes('/admin/')) return 'Lawyers';
  return (
    ROUTE_LABELS[seg] ??
    seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ')
  );
}

/** Builds trail after "Home" from the URL. Returns [] if breadcrumbs should be hidden. */
function pathCrumbs(
  pathname: string,
  routeParams: Record<string, string | undefined>,
  activeRole: string | undefined
): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return [];

  const home: BreadcrumbItem = {
    label: 'Home',
    to: dashboardHref(pathname, activeRole),
  };
  const casesList = casesListHref(pathname, activeRole);
  const params = paramSet(routeParams);
  const out: BreadcrumbItem[] = [home];
  let prefix = '';

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    prefix += `/${seg}`;

    if (i === 0 && ROLE_PREFIX_SEGMENTS.has(seg)) continue;

    const last = i === segments.length - 1;
    const label = segmentLabel(seg, i, segments, params, pathname);
    const to = last ? undefined : prefix === '/cases' ? casesList : prefix;

    out.push({ label, to });
  }

  return out;
}

const Breadcrumbs = () => {
  const { pathname } = useLocation();
  const params = useParams();
  const activeRole = getCookie('x-active-role');

  const crumbs = pathCrumbs(pathname, params, activeRole);
  if (crumbs.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-4 flex items-center gap-1.5 text-sm"
    >
      {crumbs.map((crumb, i) => (
        <span key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
          {i > 0 && (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          )}
          {crumb.to ? (
            <Link
              to={crumb.to}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {i === 0 ? (
                <span className="flex items-center gap-1">
                  <Home className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{crumb.label}</span>
                </span>
              ) : (
                crumb.label
              )}
            </Link>
          ) : (
            <span
              className="max-w-[min(100%,20rem)] truncate font-mono text-xs font-medium text-foreground md:text-sm"
              title={crumb.label}
            >
              {crumb.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
