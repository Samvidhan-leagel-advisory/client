import type { Payment, Subscription, SubscriptionPlan } from '@/types';

export const mockPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 999,
    period: 'yearly',
    features: [
      'Unlimited legal queries',
      'Standard response time (48 hrs)',
      'Document review (up to 5/month)',
      'Email support',
      'Case tracking dashboard',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 1999,
    period: 'yearly',
    isPopular: true,
    badge: 'Most Popular',
    features: [
      'Everything in Basic',
      'Priority response (24 hrs)',
      'Unlimited document review',
      'Phone consultation (2/month)',
      'Dedicated case manager',
      'Legal notice drafting',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 4999,
    period: 'yearly',
    badge: 'Best Value',
    features: [
      'Everything in Professional',
      'Emergency consultation (4 hrs)',
      'Unlimited phone & video calls',
      'On-site assistance (metro cities)',
      'Court representation coordination',
      'Priority case assignment',
      'Dedicated senior advocate',
    ],
  },
];

export const mockSubscription: Subscription = {
  id: 's1',
  userId: 'u1',
  planId: 'professional',
  planName: 'Professional',
  status: 'active',
  startDate: '2024-08-15',
  endDate: '2025-08-15',
  autoRenew: true,
};

export const mockPayments: Payment[] = [
  {
    id: 'p1',
    userId: 'u1',
    userName: 'Rajesh Kumar',
    amount: 1999,
    method: 'upi',
    status: 'success',
    planName: 'Professional',
    transactionId: 'TXN202408150001',
    createdAt: '2024-08-15',
  },
  {
    id: 'p2',
    userId: 'u2',
    userName: 'Meera Patel',
    amount: 999,
    method: 'credit_card',
    status: 'success',
    planName: 'Basic',
    transactionId: 'TXN202409010002',
    createdAt: '2024-09-01',
  },
  {
    id: 'p3',
    userId: 'u3',
    userName: 'Arjun Singh',
    amount: 4999,
    method: 'net_banking',
    status: 'pending',
    planName: 'Premium',
    transactionId: 'TXN202410050003',
    createdAt: '2024-10-05',
  },
];

export const adminStats = {
  totalUsers: 1247,
  totalLawyers: 83,
  activeCases: 312,
  resolvedCases: 1856,
  monthlyRevenue: 487500,
  emergencyRequests: 4,
  pendingVerifications: 7,
  activePlans: { basic: 645, professional: 412, premium: 190 },
};

// ─── Shared filter options & constants ───────────────────────────

export const PAGE_SIZE = 10;
export const MAX_FILES = 5;
export const MAX_SIZE_MB = 10;

/** Short label for lists and headers; long context belongs in description. */
export const CASE_TITLE_MAX_LENGTH = 300;

/** Lawyer profile bio shown to clients. */
export const LAWYER_BIO_MAX_LENGTH = 1000;

export const CASE_STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'lawyer_assigned', label: 'Lawyer Assigned' },
  { value: 'closed', label: 'Closed' },
  { value: 'rejected', label: 'Rejected' },
];

export const NOTIFICATION_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'info', label: 'Info' },
  { value: 'success', label: 'Success' },
  { value: 'warning', label: 'Warning' },
];

export const CATEGORY_SKELETON_WIDTHS = [
  'w-3/4',
  'w-full',
  'w-2/3',
  'w-5/6',
  'w-4/5',
  'w-full',
  'w-3/5',
  'w-11/12',
];
