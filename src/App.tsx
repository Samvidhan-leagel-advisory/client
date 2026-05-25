import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { CaseChatGlobalNotifier } from '@/components/case-chat/CaseChatGlobalNotifier';
import { LawyerApprovedGate } from '@/components/LawyerApprovedGate';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { env } from '@/config/env';
import { ROUTE_PATTERNS, ROUTES } from '@/constants';
import { AuthProvider } from '@/contexts/AuthContext';
import { FcmTokenSync } from '@/hooks/use-fcm-token';
import { isReactNativeWebView } from '@/lib/is-react-native-webview';
import { queryClient } from '@/lib/query-client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import AboutPage from './pages/AboutPage';
import DpdpConsentPage from './pages/DpdpConsentPage';
import DummyLoginPage from './pages/DummyLoginPage';
import FAQPage from './pages/FAQPage';
import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import TermsPage from './pages/TermsPage';

import CaseInternalNotesPage from './pages/CaseInternalNotesPage';
import CaseDetail from './pages/user/CaseDetail';
import CaseDocuments from './pages/user/CaseDocuments';
import LawyersDirectory from './pages/user/LawyersDirectory';
import NewCase from './pages/user/NewCase';
import UserCases from './pages/user/UserCases';
import UserDashboard from './pages/user/UserDashboard';
import UserProfile from './pages/user/UserProfile';
import UserSubscription from './pages/user/UserSubscription';

import LawyerCases from './pages/lawyer/LawyerCases';
import LawyerDashboard from './pages/lawyer/LawyerDashboard';
import LawyerDocuments from './pages/lawyer/LawyerDocuments';

import AdminCaseDetail from './pages/admin/AdminCaseDetail';
import AdminCaseDocuments from './pages/admin/AdminCaseDocuments';
import AdminCases from './pages/admin/AdminCases';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLawyerDetail from './pages/admin/AdminLawyerDetail';
import AdminLawyerDocumentsPage from './pages/admin/AdminLawyerDocumentsPage';
import AdminLawyers from './pages/admin/AdminLawyers';
import AdminNewCase from './pages/admin/AdminNewCase';
import AdminPayments from './pages/admin/AdminPayments';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminUsers from './pages/admin/AdminUsers';

import AdminCaseRequests from './pages/admin/AdminCaseRequests';
import AdminLawyerPendingDocumentsPage from './pages/admin/AdminLawyerPendingDocumentsPage';
import AdminLawyerVerifications from './pages/admin/AdminLawyerVerifications';
import AdminSessionRequests from './pages/admin/AdminSessionRequests';
import CaseChatPage from './pages/CaseChat';
import CaseNotificationsPage from './pages/CaseNotificationsPage';
import NotFound from './pages/NotFound';

/** In the RN WebView shell we use native Custom Tabs for Google — skip GIS script (blocked in WebView). */
const AppInner = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <FcmTokenSync />
          <CaseChatGlobalNotifier />
          <Routes>
            {/* Public */}
            <Route path={ROUTES.home} element={<Index />} />
            <Route path={ROUTES.about} element={<AboutPage />} />
            <Route path={ROUTES.faq} element={<FAQPage />} />
            <Route path={ROUTES.terms} element={<TermsPage />} />
            <Route path={ROUTES.dpdpConsent} element={<DpdpConsentPage />} />
            <Route
              path={ROUTES.plans}
              element={<Navigate to={ROUTES.home} replace />}
            />
            <Route
              path={ROUTES.howItWorks}
              element={
                <Navigate
                  to={{ pathname: ROUTES.home, hash: 'case-flow' }}
                  replace
                />
              }
            />
            <Route path={ROUTES.login} element={<LoginPage />} />
            <Route path="/dummy-login" element={<DummyLoginPage />} />

            {/* User */}
            <Route
              path={ROUTES.user.dashboard}
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.user.notifications}
              element={
                <ProtectedRoute allowedRoles={['user', 'lawyer']}>
                  <LawyerApprovedGate>
                    <CaseNotificationsPage />
                  </LawyerApprovedGate>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.user.cases}
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserCases />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTE_PATTERNS.caseDetail}
              element={
                <ProtectedRoute allowedRoles={['user', 'lawyer']}>
                  <LawyerApprovedGate>
                    <CaseDetail />
                  </LawyerApprovedGate>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTE_PATTERNS.caseDocuments}
              element={
                <ProtectedRoute allowedRoles={['user', 'lawyer']}>
                  <LawyerApprovedGate>
                    <CaseDocuments />
                  </LawyerApprovedGate>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTE_PATTERNS.caseInternalNotes}
              element={<CaseInternalNotesPage />}
            />
            <Route
              path={ROUTE_PATTERNS.caseChat}
              element={
                <ProtectedRoute allowedRoles={['user', 'lawyer']}>
                  <LawyerApprovedGate>
                    <CaseChatPage />
                  </LawyerApprovedGate>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.user.newCase}
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <NewCase />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.user.subscription}
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserSubscription />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.user.profile}
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.user.lawyers}
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <LawyersDirectory />
                </ProtectedRoute>
              }
            />

            {/* Lawyer */}
            <Route
              path={ROUTES.lawyer.dashboard}
              element={
                <ProtectedRoute allowedRoles={['lawyer']}>
                  <LawyerApprovedGate>
                    <LawyerDashboard />
                  </LawyerApprovedGate>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.lawyer.cases}
              element={
                <ProtectedRoute allowedRoles={['lawyer']}>
                  <LawyerApprovedGate>
                    <LawyerCases />
                  </LawyerApprovedGate>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.lawyer.documents}
              element={
                <ProtectedRoute allowedRoles={['lawyer']}>
                  <LawyerDocuments />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.lawyer.profile}
              element={
                <ProtectedRoute allowedRoles={['lawyer']}>
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            {/* Admin */}
            <Route
              path={ROUTES.admin.dashboard}
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
            <Route
              path={ROUTES.admin.notifications}
              element={
                <AdminProtectedRoute>
                  <CaseNotificationsPage />
                </AdminProtectedRoute>
              }
            />

            <Route
              path={ROUTES.admin.caseRequests}
              element={
                <AdminProtectedRoute>
                  <AdminCaseRequests />
                </AdminProtectedRoute>
              }
            />

            <Route
              path={ROUTES.admin.sessionRequests}
              element={
                <AdminProtectedRoute>
                  <AdminSessionRequests />
                </AdminProtectedRoute>
              }
            />
            <Route
              path={ROUTES.admin.lawyerPendingDocuments}
              element={
                <AdminProtectedRoute>
                  <AdminLawyerPendingDocumentsPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path={ROUTES.admin.users}
              element={
                <AdminProtectedRoute>
                  <AdminUsers />
                </AdminProtectedRoute>
              }
            />
            <Route
              path={ROUTE_PATTERNS.adminUserNewCase}
              element={
                <AdminProtectedRoute>
                  <AdminNewCase />
                </AdminProtectedRoute>
              }
            />
            <Route
              path={ROUTE_PATTERNS.adminUserDetail}
              element={
                <AdminProtectedRoute>
                  <AdminUserDetail />
                </AdminProtectedRoute>
              }
            />
            <Route
              path={ROUTES.admin.lawyers}
              element={
                <AdminProtectedRoute>
                  <AdminLawyers />
                </AdminProtectedRoute>
              }
            />
            <Route
              path={ROUTE_PATTERNS.adminLawyerDocuments}
              element={
                <AdminProtectedRoute>
                  <AdminLawyerDocumentsPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path={ROUTE_PATTERNS.adminLawyerDetail}
              element={
                <AdminProtectedRoute>
                  <AdminLawyerDetail />
                </AdminProtectedRoute>
              }
            />
            <Route
              path={ROUTES.admin.cases}
              element={
                <AdminProtectedRoute>
                  <AdminCases />
                </AdminProtectedRoute>
              }
            />

            <Route
              path={ROUTES.admin.lawyerVerifications}
              element={
                <AdminProtectedRoute>
                  <AdminLawyerVerifications />
                </AdminProtectedRoute>
              }
            />
            <Route
              path={ROUTE_PATTERNS.adminCaseDetail}
              element={
                <AdminProtectedRoute>
                  <AdminCaseDetail />
                </AdminProtectedRoute>
              }
            />
            <Route
              path={ROUTE_PATTERNS.adminCaseChat}
              element={
                <AdminProtectedRoute>
                  <CaseChatPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path={ROUTE_PATTERNS.adminCaseDocuments}
              element={
                <AdminProtectedRoute>
                  <AdminCaseDocuments />
                </AdminProtectedRoute>
              }
            />
            <Route
              path={ROUTES.admin.subscriptions}
              element={
                <AdminProtectedRoute>
                  <AdminSubscriptions />
                </AdminProtectedRoute>
              }
            />
            <Route
              path={ROUTES.admin.payments}
              element={
                <AdminProtectedRoute>
                  <AdminPayments />
                </AdminProtectedRoute>
              }
            />

            {/* <Route
              path={ROUTES.admin.settings}
              element={
                <AdminProtectedRoute>
                  <AdminSettings />
                </AdminProtectedRoute>
              }
            /> */}

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

const App = () =>
  isReactNativeWebView() ? (
    <AppInner />
  ) : (
    <GoogleOAuthProvider clientId={env.googleClientId}>
      <AppInner />
    </GoogleOAuthProvider>
  );

export default App;
