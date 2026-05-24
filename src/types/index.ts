import type { CSSProperties, ReactNode } from 'react';

export type UserRole = 'user' | 'lawyer' | 'admin';

export interface User {
  id: string;
  name: string;
  memNumber?: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  isActive: boolean;
  password: string;
  fullName: string;
  avatarUrl: string | null;
  accountStatus?: 'active' | 'inactive' | 'pending' | 'blocked';
}

export interface UsersListResponse {
  data: User[];
  pagination: Pagination;
}

export interface Lawyer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  specializations: LegalCategory[];
  barCouncilId: string;
  experience: number;
  degree: string;
  bio: string;
  isVerified: boolean;
  isAvailable: boolean;
  rating: number;
  casesHandled: number;
  createdAt: string;
}

export type LegalCategory =
  | 'civil'
  | 'criminal'
  | 'family'
  | 'property'
  | 'corporate'
  | 'consumer'
  | 'documentation'
  | 'other';

export const LEGAL_CATEGORIES: Record<LegalCategory, string> = {
  civil: 'Civil Law',
  criminal: 'Criminal Law',
  family: 'Family Law',
  property: 'Property Dispute',
  corporate: 'Corporate Law',
  consumer: 'Consumer Complaint',
  documentation: 'Documentation / Legal Notice',
  other: 'Other',
};

export type CaseStatus =
  | 'new'
  | 'under_review'
  | 'lawyer_assigned'
  | 'resolved'
  | 'closed'
  | 'rejected';

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  new: 'New',
  under_review: 'Under Review',
  lawyer_assigned: 'Lawyer Assigned',
  resolved: 'Resolved',
  closed: 'Closed',
  rejected: 'Rejected',
};

export interface Case {
  id: string;
  caseNumber: string;
  userId: string;
  userName: string;
  lawyerId?: string;
  lawyerName?: string;
  category: LegalCategory;
  title: string;
  description: string;
  status: CaseStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  documents: CaseDocument[];
  timeline: TimelineEvent[];
  messages: CaseMessage[];
  notes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CaseDocument {
  id: string;
  caseId: string;
  author: UserRole;
  assetUrl: string;
  assetType: string;
  assetName?: string;
  createdAt: string;
}

/** Lawyer vault row from GET /api/lawyers/documents */
export interface LawyerDocument {
  id: string;
  lawyerProfileId: string;
  assetUrl: string;
  assetName?: string | null;
  isApproved: boolean;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** PATCH /api/admin/lawyers/documents/:documentId/review */
export interface ReviewLawyerDocumentBody {
  isApproved: boolean;
  rejectionReason?: string | null;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'status_change' | 'message' | 'document' | 'note' | 'assignment';
}

/** Aligns with backend `MessageType` for case thread rows. */
export type CaseChatMessageType = 'text' | 'image' | 'document' | 'audio';

export interface CaseMessage {
  id: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  messageType?: CaseChatMessageType;
  /** Chat attachment URL (GCS etc.) — no join to case documents. */
  assetUrl?: string | null;
  assetName?: string | null;
  attachments?: CaseDocument[];
  /** Echoed on Socket.IO only; omitted from REST. Used to match outbound sends. */
  clientMessageId?: string;
}

/** GET /api/cases/:caseId/messages (and admin equivalent). */
export interface CaseMessagesPage {
  messages: CaseMessage[];
  hasMore: boolean;
  oldestMessageId: string | null;
}

/** GET /api/cases/chat-unread and GET /api/admin/cases/chat-unread */
export interface CaseChatUnreadItem {
  caseId: string;
  caseCode: string;
  title: string;
  unreadCount: number;
}

export interface CaseChatUnreadSummary {
  items: CaseChatUnreadItem[];
  totalUnread: number;
}

/** Socket.IO `chat.notify` — new case message for users not in that case room. */
export interface CaseChatNotifyPayload {
  caseId: string;
  caseCode: string;
  message: Omit<CaseMessage, 'clientMessageId' | 'attachments'>;
}

/** User vs admin API/socket variant for case thread messages. */
export type CaseChatVariant = 'user' | 'admin';

export type CaseChatConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'reconnecting'
  | 'open'
  | 'error';

export interface FailedChatMessage {
  clientMessageId: string;
  label: string;
  error: string;
}

export type CaseChatMarkReadFn = (
  caseId: string,
  body: { messageId: string }
) => Promise<unknown>;

export interface UseCaseChatSocketOptions {
  caseId: string | undefined;
  variant: CaseChatVariant;
  enabled: boolean;
  /** When opening a thread: keep read cursor aligned with the last loaded message. */
  markRead?: CaseChatMarkReadFn;
  isMessagesPending?: boolean;
  tailMessageId?: string;
  /** True when the last loaded message was sent by the current viewer. */
  tailFromViewer?: boolean;
}

/** Transient toast state in `CaseChatGlobalNotifier` for cross-route message peek. */
export interface CaseChatNotifierLivePeek {
  key: string;
  payload: CaseChatNotifyPayload;
  target: string;
}

export interface SendingAttachment {
  previewUrl: string | null;
  name: string;
}

export interface CaseChatThreadProps {
  variant: CaseChatVariant;
  title: string;
  messages: CaseMessage[];
  /** When set, bubbles align by participant role (your role = yours on the right). */
  viewerParticipant?: UserRole | null;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  composer: 'textarea' | 'input';
  status: CaseChatConnectionStatus;
  /** Outbound text still being confirmed by the server. */
  sendingText?: string | null;
  /** Attachments being uploaded — shown as blurred previews in the outbound bubble. */
  sendingAttachments?: SendingAttachment[];
  failedMessages?: FailedChatMessage[];
  onRetryFailed?: (clientMessageId: string) => void;
  hasOlderMessages?: boolean;
  isLoadingOlder?: boolean;
  onLoadOlder?: () => void;
  isLoadingMessages?: boolean;
  beforeSendActions?: ReactNode;
  /** Shown inside the composer pill above the text field (e.g. staged attachment). */
  composerAccessory?: ReactNode;
  /** When true, Send works even if the draft is empty (e.g. image-only message). */
  hasComposerAttachment?: boolean;
  /** Disables send and Enter-to-send (e.g. while uploading a staged attachment). */
  isComposerBusy?: boolean;
  panelStyle?: CSSProperties;
  /** When false, hide the built-in title/status header (page supplies its own chrome). */
  showThreadHeader?: boolean;
  /** `stack` = compact bubbles; `conversation` = avatar row + rounded bubbles. */
  messageLayout?: 'stack' | 'conversation';
  /** Merged onto the outer panel (e.g. `flex-1 min-h-0 border-0 shadow-none rounded-none`). */
  rootClassName?: string;
  /** Transparent footer so a pattern/image behind the thread shows around the composer pill. */
  composerOverPattern?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
  badge?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

/** Plan snapshot on subscription rows from GET /api/razorpay/subscriptions/me */
export interface SubscriptionPlanSummary {
  id: string;
  slug: string;
  name: string;
  billingCycle: string;
}

/** One Razorpay-linked row from GET /api/razorpay/subscriptions/me */
export interface UserSubscriptionHistoryRow {
  id: string;
  razorpaySubscriptionId: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  updatedAt: string;
  plan: SubscriptionPlanSummary;
}

/** GET /api/razorpay/subscriptions/me */
export interface MyRazorpaySubscriptionsResponse {
  hasActiveSubscription: boolean;
  subscription: {
    id: string;
    status: string;
    isLifetime: boolean;
    cancelledAtPeriodEnd: boolean;
    startDate: string | null;
    endDate: string | null;
    plan: SubscriptionPlanSummary;
  } | null;
}

/**
 * Normalized "currently entitled" subscription shape, shared by user `/me`
 * and admin payments hooks. Consumed by `ActiveSubscriptionCard`.
 */
export interface ActiveSubscriptionView {
  id: string;
  status: string;
  isLifetime: boolean;
  cancelledAtPeriodEnd: boolean;
  startDate: string | null;
  endDate: string | null;
  plan: {
    id?: string;
    name: string;
    billingCycle: string | null;
    priceInr?: string | number | null;
  };
  /** Razorpay subscription/order id. Optional — only rendered when present. */
  refId?: string | null;
}

/** POST /api/razorpay/subscriptions/start */
export interface StartRazorpaySubscriptionResponse {
  subscriptionId: string;
  status?: string;
  shortUrl?: string;
  razorpayKeyId: string;
  planName: string;
}

/** GET /api/subscriptions (catalog) and plan rows inside admin subscription analytics. */
export interface SubscriptionCatalogPlan {
  id: string;
  name: string;
  slug?: string;
  description: string | null;
  features: string;
  priceInr: string;
  billingCycle: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Active subscriber count per catalog plan from admin subscription analytics. */
export interface ActiveSubscriptionCountRow {
  subscriptionPlanId: string;
  name: string;
  /** Backend may serialize as string (e.g. Postgres bigint). */
  count: string | number;
}

/** GET /api/admin/subscription-analytics */
export interface AdminSubscriptionAnalyticsResponse {
  subscriptionPlans: SubscriptionCatalogPlan[];
  activeSubscriptionCounts: ActiveSubscriptionCountRow[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: 'upi' | 'credit_card' | 'debit_card' | 'net_banking';
  status: 'success' | 'pending' | 'failed';
  planName: string;
  transactionId: string;
  createdAt: string;
}

/** Nested user on GET /api/admin/payments when rows are subscriptions. */
export interface AdminPaymentListUserNested {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
}

/** Nested plan on GET /api/admin/payments when rows are subscriptions. */
export interface AdminPaymentListPlanNested {
  id: string;
  name: string;
  priceInr: string | number;
  billingCycle?: string | null;
}

/** GET /api/admin/payments — one row (Razorpay subscription or one-time order). */
export interface AdminPaymentsSubscriptionRow {
  id: string;
  /** Populated for recurring (monthly/yearly) plans. NULL for lifetime one-time plans. */
  razorpaySubscriptionId: string | null;
  /** Populated for lifetime one-time plans (Razorpay Order). NULL for recurring plans. */
  razorpayOrderId?: string | null;
  status: string;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  createdAt: string;
  updatedAt?: string;
  user?: AdminPaymentListUserNested | null;
  subscriptionPlan?: AdminPaymentListPlanNested | null;
}

export interface AdminPaymentsListResponse {
  data: AdminPaymentsSubscriptionRow[];
  pagination: Pagination;
}

export interface LawyersListUser {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  email?: string;
  phone?: string;
  userRole?: {
    id: string;
    status: 'active' | 'inactive' | 'pending' | 'blocked';
  };
}

export interface LawyerPracticeAreaRow {
  practiceArea?: { id: string; name: string };
}

export interface LawyerListItem {
  id: string;
  userId: string;
  degree: string | null;
  barCouncilId: string | null;
  careerStartDate: string | null;
  bio: string | null;
  gender: string | null;
  createdAt: string;
  updatedAt: string;
  user: LawyersListUser;
  lawyerPracticeAreas: LawyerPracticeAreaRow[];
  isVerified: boolean;
}

export interface LawyersPagination {
  total: number;
  totalPages: number;
  next: string | null;
  prev: string | null;
}

export interface LawyersListResponse {
  data: LawyerListItem[];
  pagination: LawyersPagination;
}

// Auth user (from API — has fullName, roles, avatarUrl)
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  memNumber: string;
  roles: UserRole[];
  isProfileCompleted?: boolean;
  provider: 'email' | 'google';
  lawyerProfile?: LawyerProfileApiShape | null;
}

// Cases list API response types
export interface CaseItem {
  id: string;
  caseCode: string;
  title: string;
  status: CaseStatus;
  description?: string;
  practiceArea: { id: string; name: string } | null;
    assignedLawyer: { user: { fullName: string , id: string } , id: string} | null;
  user?: { fullName: string , id: string};
  isEmergency?: boolean;
  createdAt: string;
}

/** Full case payload from GET /api/cases/:id and GET /api/admin/cases/:caseId */
export interface CaseDetails extends Omit<CaseItem, 'assignedLawyer' | 'user'> {
  assignedLawyerId?: string | null;
  assignedLawyer?: {
    id?: string;
    user: { fullName: string; avatarUrl?: string | null , id: string};
  } | null;
  messages?: CaseMessage[];
  updatedAt?: string;
  user?: { id?: string; fullName: string };
  caseSessionRequest?: unknown;
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  audioDescUrl?: string | null;
}

export interface Pagination {
  total: number;
  totalPages: number;
  next: number | null;
  prev: number | null;
}

/** GET /api/admin/lawyers/pending-documents — row may include nested lawyer for display */
export type PendingLawyerDocumentListItem = LawyerDocument & {
  lawyerProfile?: { id?: string; user?: { fullName?: string | null } };
};

export interface PendingLawyerDocumentsListResponse {
  data: PendingLawyerDocumentListItem[];
  pagination: Pagination;
}

export interface CasesResponse {
  data: CaseItem[];
  pagination: Pagination;
}

// Upload API response
export interface UploadedDoc {
  assetUrl: string;
  assetType: string;
  assetName?: string;
}

/** Align with backend CallType enum (adjust if your API uses different strings). */
export type CaseSessionCallType = 'video' | 'audio';

/** Align with backend CaseSessionRequestRaisedBy enum. */
export type CaseSessionRequestRaisedBy = 'user' | 'lawyer' | 'admin';

export interface CreateCaseSessionRequestBody {
  caseId: string;
  requestedDate: string;
  requestedTime: string;
  callType?: CaseSessionCallType;
  raisedBy?: CaseSessionRequestRaisedBy;
}

// Notification types
export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'consultation';

export type ConsultationStatus = 'pending' | 'accepted' | 'declined';

export interface ConsultationDetails {
  sessionType: string;
  date: string;
  time: string;
  userName: string;
  caseNumber: string;
  status: ConsultationStatus;
  meetLink?: string;
}

export interface ConsultationNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  link?: string;
  consultationDetails?: ConsultationDetails;
}

// Form validation types
export interface FieldErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export interface RegistrationFields {
  name: string;
  email: string;
  phone: string;
  password: string;
}

// Modal prop types
export interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  onSave: (data: Partial<User>, message?: string) => void;
}

export interface LawyerFormModalProps {
  open: boolean;
  onClose: () => void;
  lawyer?: LawyerListItem | null;
  onSave: (data: Record<string, unknown>, message?: string) => void;
}

// Admin auth types
export interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export interface LawyerProfileApiShape {
  degree?: string | null;
  barCouncilId?: string | null;
  careerStartDate?: string | null;
  gender?: string | null;
  dob?: string | null;
  bio?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  lawyerPracticeAreas?: { practiceAreaId: string }[];
  isProfileCompleted?: boolean;
  isVerified?: boolean;
}

export interface CurrentUserApi {
  fullName?: string | null;
  phone?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  lawyerProfile?: LawyerProfileApiShape | null;
}

export interface ProfileFormState {
  fullName: string;
  phone: string;
  avatarUrl: string | null;
  gender: string;
  dob: string;
  degree: string;
  barCouncilId: string;
  careerStartDate: string;
  bio: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  selectedSpecializations: string[];
}
