import { ROUTES } from '@/constants/routes';
import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Briefcase,
  CalendarCheck,
  CreditCard,
  FilePlus,
  FileStack,
  FileText,
  LayoutDashboard,
  Plus,
  Settings,
  ShieldCheck,
  User,
  UserCheck,
  Users,
} from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const USER_NAV: NavItem[] = [
  { label: 'Dashboard', to: ROUTES.user.dashboard, icon: LayoutDashboard },
  { label: 'Messages', to: ROUTES.user.notifications, icon: Bell },
  { label: 'My Cases', to: ROUTES.user.cases, icon: Briefcase },
  { label: 'New Case', to: ROUTES.user.newCase, icon: Plus },
  { label: 'Our Lawyers', to: ROUTES.user.lawyers, icon: Users },
  { label: 'Subscription', to: ROUTES.user.subscription, icon: CreditCard },
  { label: 'Profile', to: ROUTES.user.profile, icon: User },
];

export const LAWYER_NAV: NavItem[] = [
  { label: 'Dashboard', to: ROUTES.lawyer.dashboard, icon: LayoutDashboard },
  { label: 'Messages', to: ROUTES.user.notifications, icon: Bell },
  { label: 'Cases', to: ROUTES.lawyer.cases, icon: Briefcase },
  { label: 'Documents', to: ROUTES.lawyer.documents, icon: FileText },
  { label: 'Profile', to: ROUTES.lawyer.profile, icon: User },
];

/** Marketing / public site header nav (paths only). */
export const PUBLIC_NAV_LINKS = [
  { label: 'Home', to: ROUTES.home },
  { label: 'Case flow', to: '/#case-flow' },
  { label: 'About', to: ROUTES.about },
  { label: 'FAQ', to: ROUTES.faq },
] as const;

export const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', to: ROUTES.admin.dashboard, icon: LayoutDashboard },
  { label: 'Case messages', to: ROUTES.admin.notifications, icon: Bell },
  { label: 'Users', to: ROUTES.admin.users, icon: Users },
  { label: 'Lawyers', to: ROUTES.admin.lawyers, icon: UserCheck },
  {
    label: 'Lawyer Verifications',
    to: ROUTES.admin.lawyerVerifications,
    icon: ShieldCheck,
  },
  { label: 'Cases', to: ROUTES.admin.cases, icon: Briefcase },
  { label: 'Case Requests', to: ROUTES.admin.caseRequests, icon: FilePlus },
  {
    label: 'Session Requests',
    to: ROUTES.admin.sessionRequests,
    icon: CalendarCheck,
  },
  {
    label: 'Pending documents',
    to: ROUTES.admin.lawyerPendingDocuments,
    icon: FileStack,
  },
  { label: 'Subscriptions', to: ROUTES.admin.subscriptions, icon: FileText },
  { label: 'Payments', to: ROUTES.admin.payments, icon: CreditCard },
  { label: 'Settings', to: ROUTES.admin.settings, icon: Settings },
];
