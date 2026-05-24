/**
 * Browser paths for React Router and redirects.
 * API URLs stay in `src/api-client/routes`.
 *
 * FCM push deep links: keep path strings aligned with `nyaya/src/push-notifications/push-app-paths.ts`.
 */

export const PATH_PREFIX = {
  admin: '/admin',
  lawyer: '/lawyer',
} as const;

/** Static marketing / auth paths */
export const ROUTES = {
  home: '/',
  faq: '/faq',
  terms: '/terms',
  dpdpConsent: '/dpdp-consent',
  /** @deprecated Public marketing removed — redirects to home */
  plans: '/plans',
  about: '/about',
  howItWorks: '/how-it-works',
  login: '/login',
  register: '/login',
  forgotPassword: '/forgot-password',
  user: {
    dashboard: `/dashboard`,
    cases: `/cases`,
    /** Unread case messages (user + lawyer shells). */
    notifications: `/notifications`,
    newCase: `/new-case`,
    subscription: `/subscription`,
    profile: `/profile`,
    lawyers: `/lawyers`,
  },
  lawyer: {
    dashboard: `${PATH_PREFIX.lawyer}/dashboard`,
    cases: `${PATH_PREFIX.lawyer}/cases`,
    profile: `${PATH_PREFIX.lawyer}/profile`,
    documents: `${PATH_PREFIX.lawyer}/documents`,
  },
  admin: {
    dashboard: `${PATH_PREFIX.admin}/dashboard`,
    users: `${PATH_PREFIX.admin}/users`,
    lawyers: `${PATH_PREFIX.admin}/lawyers`,
    lawyerVerifications: `${PATH_PREFIX.admin}/lawyer-verifications`,
    cases: `${PATH_PREFIX.admin}/cases`,
    caseRequests: `${PATH_PREFIX.admin}/case-requests`,
    sessionRequests: `${PATH_PREFIX.admin}/session-requests`,
    lawyerPendingDocuments: `${PATH_PREFIX.admin}/lawyer-pending-documents`,
    subscriptions: `${PATH_PREFIX.admin}/subscriptions`,
    payments: `${PATH_PREFIX.admin}/payments`,
    settings: `${PATH_PREFIX.admin}/settings`,
    /** Unread case messages (admin shell). */
    notifications: `${PATH_PREFIX.admin}/notifications`
  },
} as const;

/** Route patterns for `<Route path={...} />` (includes param tokens). */
export const ROUTE_PATTERNS = {
  caseDetail: '/cases/:id',
  caseDocuments: '/cases/:id/documents',
  caseInternalNotes: '/cases/:id/internal-notes',
  caseChat: '/cases/:id/chat',
  adminUserDetail: `${PATH_PREFIX.admin}/users/:id`,
  adminUserNewCase: `${PATH_PREFIX.admin}/users/:id/new-case`,
  adminLawyerDetail: `${PATH_PREFIX.admin}/lawyers/:id`,
  adminLawyerDocuments: `${PATH_PREFIX.admin}/lawyers/:id/documents`,
  adminCaseDetail: `${PATH_PREFIX.admin}/cases/:id`,
  adminCaseChat: `${PATH_PREFIX.admin}/cases/:id/chat`,
  adminCaseDocuments: `${PATH_PREFIX.admin}/cases/:id/documents`,
} as const;

export const path = {
  caseDetail: (id: string) => `/cases/${id}`,
  caseChat: (id: string) => `/cases/${id}/chat`,
  caseDocuments: (id: string) => `/cases/${id}/documents`,
  caseInternalNotes: (id: string) => `/cases/${id}/internal-notes`,
  adminCase: (id: string) => `${ROUTES.admin.cases}/${id}`,
  adminCaseChat: (id: string) => `${ROUTES.admin.cases}/${id}/chat`,
  adminCaseDocuments: (id: string) =>
    `${ROUTES.admin.cases}/${id}/documents`,
  adminUser: (id: string) => `${ROUTES.admin.users}/${id}`,
  adminUserNewCase: (id: string) => `${ROUTES.admin.users}/${id}/new-case`,
  adminLawyer: (id: string) => `${ROUTES.admin.lawyers}/${id}`,
  adminLawyerDocuments: (id: string) =>
    `${ROUTES.admin.lawyers}/${id}/documents`,
};

export function dashboardForRole(
  role: 'user' | 'lawyer' | 'admin' | string | undefined
) {
  if (role === 'admin') return ROUTES.admin.dashboard;
  if (role === 'lawyer') return ROUTES.lawyer.dashboard;
  return ROUTES.user.dashboard;
}

/** Full-screen case chat — hide global inbox UI and skip unread polling. */
export function isCaseChatPathname(pathname: string) {
  return (
    /^\/cases\/[^/]+\/chat\/?$/.test(pathname) ||
    /^\/admin\/cases\/[^/]+\/chat\/?$/.test(pathname)
  );
}

/** Full-screen case sub-pages — no breadcrumb, no padding (chat, documents, internal-notes). */
export function isFullScreenCaseSubpage(pathname: string) {
  return (
    isCaseChatPathname(pathname) ||
    /^\/cases\/[^/]+\/documents\/?$/.test(pathname) ||
    /^\/cases\/[^/]+\/internal-notes\/?$/.test(pathname) ||
    /^\/admin\/cases\/[^/]+\/documents\/?$/.test(pathname)
  );
}

/** Dedicated inbox page — floating bubble hidden (sidebar link is enough). */
export function isCaseNotificationsHubPathname(pathname: string) {
  return (
    pathname === ROUTES.user.notifications ||
    pathname === ROUTES.admin.notifications
  );
}

export function caseNotificationsHubPath(pathname: string) {
  return pathname.startsWith(PATH_PREFIX.admin)
    ? ROUTES.admin.notifications
    : ROUTES.user.notifications;
}
