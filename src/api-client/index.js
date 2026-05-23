import apiClient from './axios';
import routes from './routes';

export const googleAuthLogin = (body) => {
  return apiClient({
    method: routes.GOOGLE_AUTH_LOGIN.METHOD,
    url: routes.GOOGLE_AUTH_LOGIN.URL,
    data: body,
  });
};

export const login = (body) => {
  return apiClient({
    method: routes.LOGIN.METHOD,
    url: routes.LOGIN.URL,
    data: body,
  });
};

export const adminLogin = (body) => {
  return apiClient({
    method: routes.ADMIN_LOGIN.METHOD,
    url: routes.ADMIN_LOGIN.URL,
    data: body,
  });
};

export const adminLoginVerifyOtp = (body) => {
  return apiClient({
    method: routes.ADMIN_LOGIN_VERIFY_OTP.METHOD,
    url: routes.ADMIN_LOGIN_VERIFY_OTP.URL,
    data: body,
  });
};

export const adminLoginResendOtp = (body) => {
  return apiClient({
    method: routes.ADMIN_LOGIN_RESEND_OTP.METHOD,
    url: routes.ADMIN_LOGIN_RESEND_OTP.URL,
    data: body,
  });
};

export const dummyLogin = (body) => {
  return apiClient({
    method: routes.DUMMY_LOGIN.METHOD,
    url: routes.DUMMY_LOGIN.URL,
    data: body,
  });
};

export const refreshAuthToken = () => {
  return apiClient({
    method: routes.REFRESH_TOKEN.METHOD,
    url: routes.REFRESH_TOKEN.URL,
  });
};

export const logout = () => {
  return apiClient({
    method: routes.LOGOUT.METHOD,
    url: routes.LOGOUT.URL,
  });
};

export const getCurrentUser = () => {
  return apiClient({
    method: routes.USERS_ME.METHOD,
    url: routes.USERS_ME.URL,
  });
};

export const getCasesCategories = () => {
  return apiClient({
    method: routes.CATEGORIES.METHOD,
    url: routes.CATEGORIES.URL,
  });
};

export const createCase = (body) => {
  return apiClient({
    method: routes.CREATE_CASE.METHOD,
    url: routes.CREATE_CASE.URL,
    data: body,
  });
};

export const uploadAsset = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient({
    method: routes.UPLOAD_ASSET.METHOD,
    url: routes.UPLOAD_ASSET.URL,
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const proxyAsset = (url) => {
  return apiClient({
    method: routes.PROXY_ASSET.METHOD,
    url: routes.PROXY_ASSET.URL,
    params: { url },
  });
};

export const getCases = (params) => {
  return apiClient({
    method: routes.GET_CASES.METHOD,
    url: routes.GET_CASES.URL,
    params,
  });
};

export const getAdminSessionRequests = (params) => {
  return apiClient({
    method: routes.ADMIN_SESSION_REQUESTS.METHOD,
    url: routes.ADMIN_SESSION_REQUESTS.URL,
    params,
  });
};

export const getAdminCaseRequests = (params) => {
  return apiClient({
    method: routes.ADMIN_CASE_REQUESTS.METHOD,
    url: routes.ADMIN_CASE_REQUESTS.URL,
    params,
  });
};

export const getAdminLawyerVerifications = (params, body) => {
  return apiClient({
    method: routes.ADMIN_LAWYER_VERIFICATIONS.METHOD,
    url: routes.ADMIN_LAWYER_VERIFICATIONS.URL,
    params,
  });
};

export const createAdminUser = (body) => {
  return apiClient({
    method: routes.CREATE_ADMIN_USER.METHOD,
    url: routes.CREATE_ADMIN_USER.URL,
    data: body,
  });
};

export const getAdminPayments = (params) => {
  return apiClient({
    method: routes.ADMIN_PAYMENTS.METHOD,
    url: routes.ADMIN_PAYMENTS.URL,
    params,
  });
};

export const getAdminUsers = (params) => {
  return apiClient({
    method: routes.ADMIN_USERS.METHOD,
    url: routes.ADMIN_USERS.URL,
    params,
  });
};

export const updateAdminCaseStatus = (caseId, status) => {
  return apiClient({
    method: routes.ADMIN_CASE_STATUS.METHOD,
    url: routes.ADMIN_CASE_STATUS.URL.replace(':caseId', caseId),
    data: { status },
  });
};

export const resetAdminCase = (caseId) => {
  return apiClient({
    method: routes.ADMIN_RESET_CASE.METHOD,
    url: routes.ADMIN_RESET_CASE.URL.replace(':caseId', caseId),
  });
};

export const assignAdminCaseLawyer = (caseId, lawyerId) => {
  return apiClient({
    method: routes.ADMIN_ASSIGN_CASE_LAWYER.METHOD,
    url: routes.ADMIN_ASSIGN_CASE_LAWYER.URL.replace(':caseId', caseId),
    data: { lawyerId },
  });
};

export const updateCaseSessionRequestStatus = (sessionRequestId, status) => {
  return apiClient({
    method: routes.ADMIN_SESSION_REQUEST_STATUS.METHOD,
    url: routes.ADMIN_SESSION_REQUEST_STATUS.URL.replace(
      ':sessionRequestId',
      sessionRequestId
    ),
    data: { status },
  });
};

export const createAdminCaseSessionRequest = (body) => {
  return apiClient({
    method: routes.ADMIN_CASE_SESSION_REQUEST.METHOD,
    url: routes.ADMIN_CASE_SESSION_REQUEST.URL,
    data: body,
  });
};

export const updateLawyerRoleStatus = (userId, roleCode, status) => {
  return apiClient({
    method: routes.UPDATE_LAWYER_ROLE_STATUS.METHOD,
    url: routes.UPDATE_LAWYER_ROLE_STATUS.URL.replace(
      ':userId',
      userId
    ).replace(':roleCode', roleCode),
    data: { status },
  });
};

export const getUserRole = () => {
  return apiClient({
    method: routes.CHECK_ROLE.METHOD,
    url: routes.CHECK_ROLE.URL,
  });
};

export const getUserAnalytics = () => {
  return apiClient({
    method: routes.USER_ANALYTICS.METHOD,
    url: routes.USER_ANALYTICS.URL,
  });
};

export const getAdminAnalytics = () => {
  return apiClient({
    method: routes.ADMIN_ANALYTICS.METHOD,
    url: routes.ADMIN_ANALYTICS.URL,
  });
};

export const getAdminSubscriptionAnalytics = () => {
  return apiClient({
    method: routes.ADMIN_SUBSCRIPTION_ANALYTICS.METHOD,
    url: routes.ADMIN_SUBSCRIPTION_ANALYTICS.URL,
  });
};

export const getLawyerAnalytics = () => {
  return apiClient({
    method: routes.LAWYER_ANALYTICS.METHOD,
    url: routes.LAWYER_ANALYTICS.URL,
  });
};

export const getCaseDetails = (id) => {
  return apiClient({
    method: routes.CASE_DETAILS.METHOD,
    url: routes.CASE_DETAILS.URL.replace(':id', id),
  });
};

export const getCaseMessages = (caseId, { params } = {}) => {
  return apiClient({
    method: routes.CASE_MESSAGES.METHOD,
    url: routes.CASE_MESSAGES.URL.replace(':caseId', caseId),
    params,
  });
};

export const getCaseChatUnread = () => {
  return apiClient({
    method: routes.CASE_CHAT_UNREAD.METHOD,
    url: routes.CASE_CHAT_UNREAD.URL,
  });
};

export const markCaseChatRead = (caseId, body = {}) => {
  return apiClient({
    method: routes.CASE_MARK_CHAT_READ.METHOD,
    url: routes.CASE_MARK_CHAT_READ.URL.replace(':caseId', caseId),
    data: body,
  });
};

export const getAdminCaseById = (caseId) => {
  return apiClient({
    method: routes.ADMIN_CASE_BY_ID.METHOD,
    url: routes.ADMIN_CASE_BY_ID.URL.replace(':caseId', caseId),
  });
};

export const getAdminCaseMessages = (caseId, { params } = {}) => {
  return apiClient({
    method: routes.ADMIN_CASE_MESSAGES.METHOD,
    url: routes.ADMIN_CASE_MESSAGES.URL.replace(':caseId', caseId),
    params,
  });
};

export const getAdminCaseChatUnread = () => {
  return apiClient({
    method: routes.ADMIN_CASE_CHAT_UNREAD.METHOD,
    url: routes.ADMIN_CASE_CHAT_UNREAD.URL,
  });
};

export const markAdminCaseChatRead = (caseId, body = {}) => {
  return apiClient({
    method: routes.ADMIN_CASE_MARK_CHAT_READ.METHOD,
    url: routes.ADMIN_CASE_MARK_CHAT_READ.URL.replace(':caseId', caseId),
    data: body,
  });
};

export const getSubscriptionPlans = () => {
  return apiClient({
    method: routes.SUBSCRIPTION_PLANS.METHOD,
    url: routes.SUBSCRIPTION_PLANS.URL,
  });
};

export const adminPatchSubscriptionPlan = (planId, body) => {
  return apiClient({
    method: routes.ADMIN_SUBSCRIPTION_PLAN_PATCH.METHOD,
    url: routes.ADMIN_SUBSCRIPTION_PLAN_PATCH.URL.replace(':planId', planId),
    data: body,
  });
};

export const getMyRazorpaySubscription = () => {
  return apiClient({
    method: routes.RAZORPAY_SUBSCRIPTION_ME.METHOD,
    url: routes.RAZORPAY_SUBSCRIPTION_ME.URL,
  });
};

export const startRazorpaySubscription = (body) => {
  return apiClient({
    method: routes.RAZORPAY_SUBSCRIPTION_START.METHOD,
    url: routes.RAZORPAY_SUBSCRIPTION_START.URL,
    data: body,
  });
};

export const cancelRazorpaySubscription = () => {
  return apiClient({
    method: routes.RAZORPAY_SUBSCRIPTION_CANCEL.METHOD,
    url: routes.RAZORPAY_SUBSCRIPTION_CANCEL.URL,
  });
};

export const getLawyersList = (params) => {
  return apiClient({
    method: routes.LAWYERS_LIST.METHOD,
    url: routes.LAWYERS_LIST.URL,
    params,
  });
};

export const updateUserProfile = (data) => {
  return apiClient({
    method: routes.UPDATE_ME.METHOD,
    url: routes.UPDATE_ME.URL,
    data,
  });
};

export const updateUserFcmToken = (body) => {
  return apiClient({
    method: routes.UPDATE_FCM_TOKEN.METHOD,
    url: routes.UPDATE_FCM_TOKEN.URL,
    data: body,
  });
};

export const getLawyersCases = (params) => {
  return apiClient({
    method: routes.LAWYERS_CASES.METHOD,
    url: routes.LAWYERS_CASES.URL,
    params,
  });
};

export const getAdminCases = (params) => {
  return apiClient({
    method: routes.ADMIN_CASES.METHOD,
    url: routes.ADMIN_CASES.URL,
    params,
  });
};

export const getLawyerProfile = () => {
  return apiClient({
    method: routes.LAWYERS_ME.METHOD,
    url: routes.LAWYERS_ME.URL,
  });
};

export const getAdminLawyerDetails = (id) => {
  return apiClient({
    method: routes.ADMIN_LAWYER_DETAILS.METHOD,
    url: routes.ADMIN_LAWYER_DETAILS.URL.replace(':id', id),
  });
};

export const updateLawyerProfile = (data) => {
  return apiClient({
    method: routes.UPDATE_LAWYER_PROFILE.METHOD,
    url: routes.UPDATE_LAWYER_PROFILE.URL,
    data,
  });
};

export const getLawyerDocuments = () => {
  return apiClient({
    method: routes.LAWYER_DOCUMENTS.METHOD,
    url: routes.LAWYER_DOCUMENTS.URL,
  });
};

export const createLawyerDocument = (body) => {
  return apiClient({
    method: routes.CREATE_LAWYER_DOCUMENT.METHOD,
    url: routes.CREATE_LAWYER_DOCUMENT.URL,
    data: body,
  });
};

export const deleteLawyerDocument = (documentId) => {
  return apiClient({
    method: routes.DELETE_LAWYER_DOCUMENT.METHOD,
    url: routes.DELETE_LAWYER_DOCUMENT.URL.replace(':documentId', documentId),
  });
};

export const getAdminUserDetails = (id) => {
  return apiClient({
    method: routes.ADMIN_USER_DETAILS.METHOD,
    url: routes.ADMIN_USER_DETAILS.URL.replace(':id', id),
  });
};

export const getAdminUserCases = (id, params) => {
  return apiClient({
    method: routes.ADMIN_USER_CASES.METHOD,
    url: routes.ADMIN_USER_CASES.URL.replace(':id', id),
    params,
  });
};

export const getAdminLawyerCases = (lawyerId, params) => {
  return apiClient({
    method: routes.ADMIN_LAWYER_CASES.METHOD,
    url: routes.ADMIN_LAWYER_CASES.URL.replace(':lawyerId', lawyerId),
    params,
  });
};

export const getAdminLawyerDocuments = (lawyerId) => {
  return apiClient({
    method: routes.ADMIN_LAWYER_DOCUMENTS.METHOD,
    url: routes.ADMIN_LAWYER_DOCUMENTS.URL.replace(':lawyerId', lawyerId),
  });
};

export const reviewAdminLawyerDocument = (documentId, body) => {
  return apiClient({
    method: routes.ADMIN_REVIEW_LAWYER_DOCUMENT.METHOD,
    url: routes.ADMIN_REVIEW_LAWYER_DOCUMENT.URL.replace(
      ':documentId',
      documentId
    ),
    data: body,
  });
};

export const getAdminLawyerPendingDocuments = (params) => {
  return apiClient({
    method: routes.ADMIN_LAWYER_PENDING_DOCUMENTS.METHOD,
    url: routes.ADMIN_LAWYER_PENDING_DOCUMENTS.URL,
    params,
  });
};

export const getAdminSettings = () => {
  return apiClient({
    method: routes.ADMIN_SETTINGS.METHOD,
    url: routes.ADMIN_SETTINGS.URL,
  });
};

export const updateAdminSettings = (data) => {
  return apiClient({
    method: routes.UPDATE_ADMIN_SETTINGS.METHOD,
    url: routes.UPDATE_ADMIN_SETTINGS.URL,
    data,
  });
};

export const getCaseDocuments = (caseId, params) => {
  return apiClient({
    method: routes.CASE_DOCUMENTS.METHOD,
    url: routes.CASE_DOCUMENTS.URL.replace(':caseId', caseId),
    params,
  });
};

export const getAdminCaseDocuments = (caseId, params) => {
  return apiClient({
    method: routes.ADMIN_CASE_DOCUMENTS.METHOD,
    url: routes.ADMIN_CASE_DOCUMENTS.URL.replace(':caseId', caseId),
    params,
  });
};

export const createCaseNote = (caseId, body) => {
  return apiClient({
    method: routes.CREATE_CASE_NOTE.METHOD,
    url: routes.CREATE_CASE_NOTE.URL.replace(':caseId', caseId),
    data: body,
  });
};

export const createAdminCaseNote = (caseId, body) => {
  return apiClient({
    method: routes.CREATE_ADMIN_CASE_NOTE.METHOD,
    url: routes.CREATE_ADMIN_CASE_NOTE.URL.replace(':caseId', caseId),
    data: body,
  });
};

export const getCaseInternalNotes = (caseId, params) => {
  return apiClient({
    method: routes.CASE_INTERNAL_NOTES.METHOD,
    url: routes.CASE_INTERNAL_NOTES.URL.replace(':caseId', caseId),
    params,
  });
};

export const getAdminCaseInternalNotes = (caseId, params) => {
  return apiClient({
    method: routes.ADMIN_CASE_INTERNAL_NOTES.METHOD,
    url: routes.ADMIN_CASE_INTERNAL_NOTES.URL.replace(':caseId', caseId),
    params,
  });
};

export const deleteAdminCaseNote = (noteId) => {
  return apiClient({
    method: routes.DELETE_ADMIN_CASE_NOTE.METHOD,
    url: routes.DELETE_ADMIN_CASE_NOTE.URL.replace(':noteId', noteId),
  });
};

export const uploadCaseDocument = (caseId, body) => {
  return apiClient({
    method: routes.UPLOAD_CASE_DOCUMENT.METHOD,
    url: routes.UPLOAD_CASE_DOCUMENT.URL.replace(':caseId', caseId),
    data: body,
  });
};

export const createCaseSessionRequest = (caseId, body) => {
  return apiClient({
    method: routes.CASE_SESSION_REQUEST.METHOD,
    url: routes.CASE_SESSION_REQUEST.URL.replace(':caseId', caseId),
    data: body,
  });
};

export const deleteCaseSessionRequest = (sessionRequestId) => {
  return apiClient({
    method: routes.CASE_SESSION_REQUEST_DELETE.METHOD,
    url: routes.CASE_SESSION_REQUEST_DELETE.URL.replace(
      ':sessionRequestId',
      sessionRequestId
    ),
  });
};

export const deleteAdminCaseSessionRequest = (sessionRequestId) => {
  return apiClient({
    method: routes.ADMIN_SESSION_REQUEST_DELETE.METHOD,
    url: routes.ADMIN_SESSION_REQUEST_DELETE.URL.replace(
      ':sessionRequestId',
      sessionRequestId
    ),
  });
};

export const addLawyer = (data) => {
  return apiClient({
    method: routes.ADD_LAWYER.METHOD,
    url: routes.ADD_LAWYER.URL,
    data,
  });
};

export const updateAdminUser = (id, data) => {
  return apiClient({
    method: routes.ADMIN_UPDATE_USER.METHOD,
    url: `${routes.ADMIN_UPDATE_USER.URL.replace(':id', id)}/update`,
    data,
  });
};

export const updateAdminLawyer = (id, data) => {
  return apiClient({
    method: routes.ADMIN_UPDATE_LAWYER.METHOD,
    url: `${routes.ADMIN_UPDATE_LAWYER.URL.replace(':id', id)}/update`,
    data,
  });
};

export const verifyAdminLawyer = (lawyerId, data) => {
  return apiClient({
    method: routes.ADMIN_VERIFY_LAWYER.METHOD,
    url: routes.ADMIN_VERIFY_LAWYER.URL.replace(':lawyerId', lawyerId),
    data,
  });
};

export const completeUserOnboarding = (data) => {
  return apiClient({
    method: routes.USER_PROFILE.METHOD,
    url: routes.USER_PROFILE.URL,
    data,
  });
};
