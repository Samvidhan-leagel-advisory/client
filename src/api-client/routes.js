const routes = {
  GOOGLE_AUTH_LOGIN: {
    URL: '/auth/google',
    METHOD: 'POST',
  },
  LOGIN: {
    URL: '/auth/email',
    METHOD: 'POST',
  },
  ADMIN_LOGIN: {
    URL: '/auth/admin/login',
    METHOD: 'POST',
  },
  ADMIN_LOGIN_VERIFY_OTP: {
    URL: '/auth/admin/login/verify-otp',
    METHOD: 'POST',
  },
  ADMIN_LOGIN_RESEND_OTP: {
    URL: '/auth/admin/login/resend-otp',
    METHOD: 'POST',
  },
  DUMMY_LOGIN: {
    URL: '/auth/dummy-login',
    METHOD: 'POST',
  },
  REFRESH_TOKEN: {
    URL: '/auth/refresh',
    METHOD: 'POST',
  },
  LOGOUT: {
    URL: '/auth/logout',
    METHOD: 'POST',
  },
  USERS_ME: {
    URL: '/users/me',
    METHOD: 'GET',
  },
  UPDATE_ME: {
    URL: '/users',
    METHOD: 'PATCH',
  },
  UPDATE_FCM_TOKEN: {
    URL: '/users/update-fcm-token',
    METHOD: 'PATCH',
  },
  CATEGORIES: {
    URL: '/cases/categories',
    METHOD: 'GET',
  },
  CREATE_CASE: {
    URL: '/cases',
    METHOD: 'POST',
  },
  UPLOAD_ASSET: {
    URL: '/assets/upload',
    METHOD: 'POST',
  },
  PROXY_ASSET: {
    URL: '/assets/proxy',
    METHOD: 'GET',
  },
  GET_CASES: {
    URL: '/cases',
    METHOD: 'GET',
  },
  CHECK_ROLE: {
    URL: '/users/me',
    METHOD: 'GET',
  },
  USER_ANALYTICS: {
    URL: '/users/analytics',
    METHOD: 'GET',
  },
  ADMIN_ANALYTICS: {
    URL: '/admin/analytics',
    METHOD: 'GET',
  },
  ADMIN_SUBSCRIPTION_ANALYTICS: {
    URL: '/admin/subscription-analytics',
    METHOD: 'GET',
  },
  CASE_DETAILS: {
    URL: '/cases/:id',
    METHOD: 'GET',
  },
  CASE_MESSAGES: {
    URL: '/cases/:caseId/messages',
    METHOD: 'GET',
  },
  CASE_CHAT_UNREAD: {
    URL: '/cases/chat-unread',
    METHOD: 'GET',
  },
  CASE_MARK_CHAT_READ: {
    URL: '/cases/:caseId/read-chat',
    METHOD: 'POST',
  },
  LAWYER_ANALYTICS: {
    URL: '/lawyers/analytics',
    METHOD: 'GET',
  },
  SUBSCRIPTION_PLANS: {
    URL: '/subscriptions',
    METHOD: 'GET',
  },
  ADMIN_SUBSCRIPTION_PLAN_PATCH: {
    URL: '/admin/subscription-plans/:planId',
    METHOD: 'PATCH',
  },
  RAZORPAY_SUBSCRIPTION_ME: {
    URL: '/razorpay/subscriptions/me',
    METHOD: 'GET',
  },
  RAZORPAY_SUBSCRIPTION_START: {
    URL: '/razorpay/subscriptions/start',
    METHOD: 'POST',
  },
  RAZORPAY_SUBSCRIPTION_CANCEL: {
    URL: '/razorpay/subscriptions/me',
    METHOD: 'DELETE',
  },
  LAWYERS_LIST: {
    URL: '/lawyers',
    METHOD: 'GET',
  },
  LAWYERS_CASES: {
    URL: '/lawyers/cases',
    METHOD: 'GET',
  },
  LAWYERS_ME: {
    URL: '/lawyers',
    METHOD: 'GET',
  },
  UPDATE_LAWYER_PROFILE: {
    URL: '/lawyers',
    METHOD: 'PATCH',
  },
  LAWYER_DOCUMENTS: {
    URL: '/lawyers/documents',
    METHOD: 'GET',
  },
  CREATE_LAWYER_DOCUMENT: {
    URL: '/lawyers/documents',
    METHOD: 'POST',
  },
  DELETE_LAWYER_DOCUMENT: {
    URL: '/lawyers/documents/:documentId',
    METHOD: 'DELETE',
  },
  ADMIN_CASE_REQUESTS: {
    URL: '/admin/cases',
    METHOD: 'GET',
  },
  ADMIN_SESSION_REQUESTS: {
    URL: '/admin/cases/session-requests',
    METHOD: 'GET',
  },
  ADMIN_CASE_STATUS: {
    URL: '/admin/cases/:caseId/update-status',
    METHOD: 'PATCH',
  },
  ADMIN_RESET_CASE: {
    URL: '/admin/cases/:caseId/reset-case',
    METHOD: 'PATCH',
  },
  ADMIN_ASSIGN_CASE_LAWYER: {
    URL: '/admin/cases/:caseId/assign-lawyer',
    METHOD: 'PATCH',
  },
  ADMIN_SESSION_REQUEST_STATUS: {
    URL: '/admin/cases/session-requests/:sessionRequestId/update-status',
    METHOD: 'PATCH',
  },
  ADMIN_SESSION_REQUEST_DELETE: {
    URL: '/admin/cases/session-requests/:sessionRequestId',
    METHOD: 'DELETE',
  },
  ADMIN_CASE_SESSION_REQUEST: {
    URL: '/admin/cases/session-requests',
    METHOD: 'POST',
  },
  ADMIN_LAWYER_VERIFICATIONS: {
    URL: '/admin/lawyers',
    METHOD: 'GET',
  },
  UPDATE_LAWYER_ROLE_STATUS: {
    URL: '/admin/users/:userId/roles/:roleCode',
    METHOD: 'PATCH',
  },
  ADMIN_CASES: {
    URL: '/admin/cases',
    METHOD: 'GET',
  },
  ADMIN_CASE_BY_ID: {
    URL: '/admin/cases/:caseId',
    METHOD: 'GET',
  },
  ADMIN_CASE_MESSAGES: {
    URL: '/admin/cases/:caseId/messages',
    METHOD: 'GET',
  },
  ADMIN_CASE_CHAT_UNREAD: {
    URL: '/admin/cases/chat-unread',
    METHOD: 'GET',
  },
  ADMIN_CASE_MARK_CHAT_READ: {
    URL: '/admin/cases/:caseId/read-chat',
    METHOD: 'POST',
  },
  ADMIN_PAYMENTS: {
    URL: '/admin/payments',
    METHOD: 'GET',
  },
  ADMIN_USERS: {
    URL: '/admin/users',
    METHOD: 'GET',
  },
  CREATE_ADMIN_USER: {
    URL: '/admin/users/create',
    METHOD: 'POST',
  },
  ADMIN_USER_DETAILS: {
    URL: '/admin/users/:id',
    METHOD: 'GET',
  },
  ADMIN_USER_CASES: {
    URL: '/admin/users/:id/cases',
    METHOD: 'GET',
  },
  ADMIN_LAWYER_DETAILS: {
    URL: '/admin/lawyers/:id',
    METHOD: 'GET',
  },
  ADMIN_LAWYER_CASES: {
    URL: '/admin/lawyers/:lawyerId/cases',
    METHOD: 'GET',
  },
  ADMIN_LAWYER_DOCUMENTS: {
    URL: '/admin/lawyers/:lawyerId/documents',
    METHOD: 'GET',
  },
  ADMIN_REVIEW_LAWYER_DOCUMENT: {
    URL: '/admin/lawyers/documents/:documentId/review',
    METHOD: 'PATCH',
  },
  ADMIN_LAWYER_PENDING_DOCUMENTS: {
    URL: '/admin/lawyers/pending-documents',
    METHOD: 'GET',
  },
  ADMIN_SETTINGS: {
    URL: '/admin/settings',
    METHOD: 'GET',
  },
  UPDATE_ADMIN_SETTINGS: {
    URL: '/admin/settings',
    METHOD: 'PATCH',
  },
  CASE_DOCUMENTS: {
    URL: '/cases/:caseId/documents',
    METHOD: 'GET',
  },
  ADMIN_CASE_DOCUMENTS: {
    URL: '/admin/cases/:caseId/documents',
    METHOD: 'GET',
  },
  CREATE_CASE_NOTE: {
    URL: '/cases/:caseId/notes',
    METHOD: 'POST',
  },
  CREATE_ADMIN_CASE_NOTE: {
    URL: '/admin/cases/:caseId/notes',
    METHOD: 'POST',
  },
  CASE_INTERNAL_NOTES: {
    URL: '/cases/:caseId/notes',
    METHOD: 'GET',
  },
  ADMIN_CASE_INTERNAL_NOTES: {
    URL: '/admin/cases/:caseId/notes',
    METHOD: 'GET',
  },
  DELETE_ADMIN_CASE_NOTE: {
    URL: '/admin/cases/notes/:noteId',
    METHOD: 'DELETE',
  },
  UPLOAD_CASE_DOCUMENT: {
    URL: '/cases/:caseId/documents/upload',
    METHOD: 'POST',
  },
  CASE_SESSION_REQUEST: {
    URL: '/cases/:caseId/session-requests',
    METHOD: 'POST',
  },
  CASE_SESSION_REQUEST_DELETE: {
    URL: '/cases/session-requests/:sessionRequestId',
    METHOD: 'DELETE',
  },
  ADD_LAWYER: {
    URL: '/admin/lawyers',
    METHOD: 'POST',
  },
  ADMIN_UPDATE_USER: {
    URL: '/admin/users/:id',
    METHOD: 'PATCH',
  },
  ADMIN_UPDATE_LAWYER: {
    URL: '/admin/lawyers/:id',
    METHOD: 'PATCH',
  },
  ADMIN_VERIFY_LAWYER: {
    URL: '/admin/lawyers/:lawyerId/verify',
    METHOD: 'PATCH',
  },
  USER_PROFILE: {
    URL: '/users',
    METHOD: 'PATCH',
  },
};

export default routes;
