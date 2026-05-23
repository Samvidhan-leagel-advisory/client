const routes = {
  GOOGLE_AUTH_LOGIN: {
    URL: '/api/auth/google',
    METHOD: 'POST',
  },
  LOGIN: {
    URL: '/api/auth/email',
    METHOD: 'POST',
  },
  ADMIN_LOGIN: {
    URL: '/api/auth/admin/login',
    METHOD: 'POST',
  },
  ADMIN_LOGIN_VERIFY_OTP: {
    URL: '/api/auth/admin/login/verify-otp',
    METHOD: 'POST',
  },
  ADMIN_LOGIN_RESEND_OTP: {
    URL: '/api/auth/admin/login/resend-otp',
    METHOD: 'POST',
  },
  DUMMY_LOGIN: {
    URL: '/api/auth/dummy-login',
    METHOD: 'POST',
  },
  REFRESH_TOKEN: {
    URL: '/api/auth/refresh',
    METHOD: 'POST',
  },
  LOGOUT: {
    URL: '/api/auth/logout',
    METHOD: 'POST',
  },
  USERS_ME: {
    URL: '/api/users/me',
    METHOD: 'GET',
  },
  UPDATE_ME: {
    URL: '/api/users',
    METHOD: 'PATCH',
  },
  UPDATE_FCM_TOKEN: {
    URL: '/api/users/update-fcm-token',
    METHOD: 'PATCH',
  },
  CATEGORIES: {
    URL: '/api/cases/categories',
    METHOD: 'GET',
  },
  CREATE_CASE: {
    URL: '/api/cases',
    METHOD: 'POST',
  },
  UPLOAD_ASSET: {
    URL: '/api/assets/upload',
    METHOD: 'POST',
  },
  PROXY_ASSET: {
    URL: '/api/assets/proxy',
    METHOD: 'GET',
  },
  GET_CASES: {
    URL: '/api/cases',
    METHOD: 'GET',
  },
  CHECK_ROLE: {
    URL: '/api/users/me',
    METHOD: 'GET',
  },
  USER_ANALYTICS: {
    URL: '/api/users/analytics',
    METHOD: 'GET',
  },
  ADMIN_ANALYTICS: {
    URL: '/api/admin/analytics',
    METHOD: 'GET',
  },
  ADMIN_SUBSCRIPTION_ANALYTICS: {
    URL: '/api/admin/subscription-analytics',
    METHOD: 'GET',
  },
  CASE_DETAILS: {
    URL: '/api/cases/:id',
    METHOD: 'GET',
  },
  CASE_MESSAGES: {
    URL: '/api/cases/:caseId/messages',
    METHOD: 'GET',
  },
  CASE_CHAT_UNREAD: {
    URL: '/api/cases/chat-unread',
    METHOD: 'GET',
  },
  CASE_MARK_CHAT_READ: {
    URL: '/api/cases/:caseId/read-chat',
    METHOD: 'POST',
  },
  LAWYER_ANALYTICS: {
    URL: '/api/lawyers/analytics',
    METHOD: 'GET',
  },
  SUBSCRIPTION_PLANS: {
    URL: '/api/subscriptions',
    METHOD: 'GET',
  },
  ADMIN_SUBSCRIPTION_PLAN_PATCH: {
    URL: '/api/admin/subscription-plans/:planId',
    METHOD: 'PATCH',
  },
  RAZORPAY_SUBSCRIPTION_ME: {
    URL: '/api/razorpay/subscriptions/me',
    METHOD: 'GET',
  },
  RAZORPAY_SUBSCRIPTION_START: {
    URL: '/api/razorpay/subscriptions/start',
    METHOD: 'POST',
  },
  RAZORPAY_SUBSCRIPTION_CANCEL: {
    URL: '/api/razorpay/subscriptions/me',
    METHOD: 'DELETE',
  },
  LAWYERS_LIST: {
    URL: '/api/lawyers',
    METHOD: 'GET',
  },
  LAWYERS_CASES: {
    URL: '/api/lawyers/cases',
    METHOD: 'GET',
  },
  LAWYERS_ME: {
    URL: '/api/lawyers',
    METHOD: 'GET',
  },
  UPDATE_LAWYER_PROFILE: {
    URL: '/api/lawyers',
    METHOD: 'PATCH',
  },
  LAWYER_DOCUMENTS: {
    URL: '/api/lawyers/documents',
    METHOD: 'GET',
  },
  CREATE_LAWYER_DOCUMENT: {
    URL: '/api/lawyers/documents',
    METHOD: 'POST',
  },
  DELETE_LAWYER_DOCUMENT: {
    URL: '/api/lawyers/documents/:documentId',
    METHOD: 'DELETE',
  },
  ADMIN_CASE_REQUESTS: {
    URL: '/api/admin/cases',
    METHOD: 'GET',
  },
  ADMIN_SESSION_REQUESTS: {
    URL: '/api/admin/cases/session-requests',
    METHOD: 'GET',
  },
  ADMIN_CASE_STATUS: {
    URL: '/api/admin/cases/:caseId/update-status',
    METHOD: 'PATCH',
  },
  ADMIN_RESET_CASE: {
    URL: '/api/admin/cases/:caseId/reset-case',
    METHOD: 'PATCH',
  },
  ADMIN_ASSIGN_CASE_LAWYER: {
    URL: '/api/admin/cases/:caseId/assign-lawyer',
    METHOD: 'PATCH',
  },
  ADMIN_SESSION_REQUEST_STATUS: {
    URL: '/api/admin/cases/session-requests/:sessionRequestId/update-status',
    METHOD: 'PATCH',
  },
  ADMIN_SESSION_REQUEST_DELETE: {
    URL: '/api/admin/cases/session-requests/:sessionRequestId',
    METHOD: 'DELETE',
  },
  ADMIN_CASE_SESSION_REQUEST: {
    URL: '/api/admin/cases/session-requests',
    METHOD: 'POST',
  },
  ADMIN_LAWYER_VERIFICATIONS: {
    URL: '/api/admin/lawyers',
    METHOD: 'GET',
  },
  UPDATE_LAWYER_ROLE_STATUS: {
    URL: '/api/admin/users/:userId/roles/:roleCode',
    METHOD: 'PATCH',
  },
  ADMIN_CASES: {
    URL: '/api/admin/cases',
    METHOD: 'GET',
  },
  ADMIN_CASE_BY_ID: {
    URL: '/api/admin/cases/:caseId',
    METHOD: 'GET',
  },
  ADMIN_CASE_MESSAGES: {
    URL: '/api/admin/cases/:caseId/messages',
    METHOD: 'GET',
  },
  ADMIN_CASE_CHAT_UNREAD: {
    URL: '/api/admin/cases/chat-unread',
    METHOD: 'GET',
  },
  ADMIN_CASE_MARK_CHAT_READ: {
    URL: '/api/admin/cases/:caseId/read-chat',
    METHOD: 'POST',
  },
  ADMIN_PAYMENTS: {
    URL: '/api/admin/payments',
    METHOD: 'GET',
  },
  ADMIN_USERS: {
    URL: '/api/admin/users',
    METHOD: 'GET',
  },
  CREATE_ADMIN_USER: {
    URL: '/api/admin/users/create',
    METHOD: 'POST',
  },
  ADMIN_USER_DETAILS: {
    URL: '/api/admin/users/:id',
    METHOD: 'GET',
  },
  ADMIN_USER_CASES: {
    URL: '/api/admin/users/:id/cases',
    METHOD: 'GET',
  },
  ADMIN_LAWYER_DETAILS: {
    URL: '/api/admin/lawyers/:id',
    METHOD: 'GET',
  },
  ADMIN_LAWYER_CASES: {
    URL: '/api/admin/lawyers/:lawyerId/cases',
    METHOD: 'GET',
  },
  ADMIN_LAWYER_DOCUMENTS: {
    URL: '/api/admin/lawyers/:lawyerId/documents',
    METHOD: 'GET',
  },
  ADMIN_REVIEW_LAWYER_DOCUMENT: {
    URL: '/api/admin/lawyers/documents/:documentId/review',
    METHOD: 'PATCH',
  },
  ADMIN_LAWYER_PENDING_DOCUMENTS: {
    URL: '/api/admin/lawyers/pending-documents',
    METHOD: 'GET',
  },
  ADMIN_SETTINGS: {
    URL: '/api/admin/settings',
    METHOD: 'GET',
  },
  UPDATE_ADMIN_SETTINGS: {
    URL: '/api/admin/settings',
    METHOD: 'PATCH',
  },
  CASE_DOCUMENTS: {
    URL: '/api/cases/:caseId/documents',
    METHOD: 'GET',
  },
  ADMIN_CASE_DOCUMENTS: {
    URL: '/api/admin/cases/:caseId/documents',
    METHOD: 'GET',
  },
  CREATE_CASE_NOTE: {
    URL: '/api/cases/:caseId/notes',
    METHOD: 'POST',
  },
  CREATE_ADMIN_CASE_NOTE: {
    URL: '/api/admin/cases/:caseId/notes',
    METHOD: 'POST',
  },
  CASE_INTERNAL_NOTES: {
    URL: '/api/cases/:caseId/notes',
    METHOD: 'GET',
  },
  ADMIN_CASE_INTERNAL_NOTES: {
    URL: '/api/admin/cases/:caseId/notes',
    METHOD: 'GET',
  },
  DELETE_ADMIN_CASE_NOTE: {
    URL: '/api/admin/cases/notes/:noteId',
    METHOD: 'DELETE',
  },
  UPLOAD_CASE_DOCUMENT: {
    URL: '/api/cases/:caseId/documents/upload',
    METHOD: 'POST',
  },
  CASE_SESSION_REQUEST: {
    URL: '/api/cases/:caseId/session-requests',
    METHOD: 'POST',
  },
  CASE_SESSION_REQUEST_DELETE: {
    URL: '/api/cases/session-requests/:sessionRequestId',
    METHOD: 'DELETE',
  },
  ADD_LAWYER: {
    URL: '/api/admin/lawyers',
    METHOD: 'POST',
  },
  ADMIN_UPDATE_USER: {
    URL: '/api/admin/users/:id',
    METHOD: 'PATCH',
  },
  ADMIN_UPDATE_LAWYER: {
    URL: '/api/admin/lawyers/:id',
    METHOD: 'PATCH',
  },
  ADMIN_VERIFY_LAWYER: {
    URL: '/api/admin/lawyers/:lawyerId/verify',
    METHOD: 'PATCH',
  },
  USER_PROFILE: {
    URL: '/api/users',
    METHOD: 'PATCH',
  },
};

export default routes;
