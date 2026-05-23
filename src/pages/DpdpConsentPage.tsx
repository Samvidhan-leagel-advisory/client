import { LegalDocPage } from '@/components/legal/LegalDocPage';
import { ROUTES } from '@/constants';
import { Shield } from 'lucide-react';

const sections = [
  {
    title: 'What we collect',
    body: 'Account details (name, email, phone), sign-in data, case titles and descriptions, messages with advocates, uploaded documents, assignment and session records, and basic usage logs for security.',
  },
  {
    title: 'Why we use it',
    body: 'To run the platform: verify users, manage cases, assign lawyers, enable chat and file sharing, send service alerts, process payments, and meet legal obligations. Case data is used only to deliver the legal services you request.',
  },
  {
    title: 'Who sees it',
    body: 'Assigned advocates, platform admins (for support and verification), and contracted service providers (hosting, payments). We do not sell personal data. We may disclose data when the law requires it.',
  },
  {
    title: 'How long we keep it',
    body: 'While your account is active and as needed for open cases, records, and compliance. Some data must be kept longer by law or for dispute resolution.',
  },
  {
    title: 'Your rights (DPDP Act, 2023)',
    body: 'You may request access, correction, or erasure where applicable; withdraw consent for consent-based processing; nominate someone to exercise rights on your behalf; and raise a grievance with us or the Data Protection Board of India.',
  },
  {
    title: 'Consent',
    body: 'Checking the box at sign-in means you have read this notice and agree to processing as described, including case and document handling. Withdrawing consent may limit platform use. Contact the grievance officer via the support email in footer or settings.',
  },
] as const;

const DpdpConsentPage = () => (
  <LegalDocPage
    title="DPDP consent notice"
    subtitle="Digital Personal Data Protection Act, 2023"
    lastUpdated="May 2026"
    icon={Shield}
    sections={sections}
    backTo={{ label: 'Back to sign in', href: ROUTES.login }}
  />
);

export default DpdpConsentPage;
