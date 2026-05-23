import { LegalDocPage } from '@/components/legal/LegalDocPage';
import { ROUTES } from '@/constants';
import { Scale } from 'lucide-react';

const sections = [
  {
    title: '1. Agreement',
    body: 'By using Samvidhan Legal Advisory you agree to these terms. If you do not agree, do not use the platform.',
  },
  {
    title: '2. The service',
    body: 'We provide a platform to open legal cases, share documents, message assigned advocates, and manage subscriptions. We are not a law firm and do not provide legal advice ourselves—advocates on the platform do.',
  },
  {
    title: '3. Your account',
    body: 'You must provide accurate information, keep login credentials secure, and use the service only for lawful purposes. You are responsible for activity under your account.',
  },
  {
    title: '4. Cases and content',
    body: 'Information and documents you submit must be truthful and relevant to your matter. Do not upload unlawful, misleading, or harmful content. We may suspend access for misuse.',
  },
  {
    title: '5. Subscriptions and payments',
    body: 'Paid features are billed as shown at checkout. Fees are generally non-refundable except where required by law or stated in our refund policy. We may change pricing with notice where applicable.',
  },
  {
    title: '6. Advocates',
    body: 'Lawyers are independent professionals. We verify credentials but do not guarantee outcomes. Your relationship with an assigned advocate is for legal services related to your case on the platform.',
  },
  {
    title: '7. Limitation of liability',
    body: 'To the extent permitted by law, we are not liable for indirect or consequential loss arising from use of the platform, advocate conduct, or delays outside our reasonable control.',
  },
  {
    title: '8. Changes and contact',
    body: 'We may update these terms. Continued use after changes means acceptance. Questions: use the support contact shown in the site footer or app settings.',
  },
] as const;

const TermsPage = () => (
  <LegalDocPage
    title="Terms & conditions"
    subtitle="Samvidhan Legal Advisory"
    lastUpdated="May 2026"
    icon={Scale}
    sections={sections}
    backTo={{ label: 'Back to home', href: ROUTES.home }}
  />
);

export default TermsPage;
