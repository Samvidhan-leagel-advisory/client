import { LegalDocPage } from '@/components/legal/LegalDocPage';
import { ROUTES } from '@/constants';
import { Trash2 } from 'lucide-react';

const sections = [
  {
    title: '1. About this page',
    body: 'This page explains how to request deletion of your Samvidhan Legal Advisory account and the personal data associated with it. Samvidhan Legal Advisory is an Indian technology platform that connects users with independent, verified advocates.',
  },
  {
    title: '2. How to request account deletion',
    body: 'Email grievance@samvidhanadvisory.com from the email address registered on your account, with "Delete my account" in the subject line. Include the name and phone number on your account so we can verify it is you. We will verify your identity, confirm by reply, and delete your account and associated personal data within 30 days, except for records we are legally required to keep (see below). You do not need the app installed to make this request.',
  },
  {
    title: '3. What gets deleted',
    body: 'Your account profile (name, email, phone, Google sign-in identifier), your case content (case titles, descriptions, audio descriptions, messages with your advocate, documents you uploaded, session requests), and your Firebase Cloud Messaging push tokens.',
  },
  {
    title: '4. What we keep and for how long',
    body: 'Payment records and tax invoices are retained for 8 years as required by Indian tax law. Case content may be retained for up to 3 years after a case closes, or longer if required by law or under a legal hold. Security logs are retained for up to 12 months. These records are kept only to meet legal obligations and are deleted once the retention period ends.',
  },
  {
    title: '5. Delete some data without closing your account',
    body: 'Under the DPDP Act, 2023 you can also request correction or deletion of specific personal data without closing your account. Email grievance@samvidhanadvisory.com with "DPDP request" in the subject line and describe what you would like corrected or deleted.',
  },
  {
    title: '6. Contact',
    body: 'Account deletion and privacy requests: grievance@samvidhanadvisory.com. General queries: support@samvidhanadvisory.com. Website: https://samvidhanadvisory.com. Registered office: Shop No 12, Shiv Surbhi Apartment, Kandivali, Chikhal Wadi, Thakur Village, Kandivali East, Mumbai, Maharashtra 400101.',
  },
] as const;

const DeleteAccountPage = () => (
  <LegalDocPage
    title="Delete your account"
    subtitle="Samvidhan Legal Advisory"
    lastUpdated="May 2026"
    icon={Trash2}
    sections={sections}
    backTo={{ label: 'Back to home', href: ROUTES.home }}
  />
);

export default DeleteAccountPage;
