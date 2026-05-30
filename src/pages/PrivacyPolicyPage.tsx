import { LegalDocPage } from '@/components/legal/LegalDocPage';
import { ROUTES } from '@/constants';
import { Lock } from 'lucide-react';

const sections = [
  {
    title: '1. Who we are',
    body: 'Samvidhan Legal Advisory ("Samvidhan", "we", "us") is an Indian technology platform that connects users with independent, verified advocates. We are not a law firm and do not provide legal advice ourselves — advocates on the platform do.',
  },
  {
    title: '2. What we collect',
    body: 'Account details you give us (name, email, phone, Google sign-in identifier); case content you create (case title, description, optional audio description, messages with your advocate, documents you upload, session requests); payment metadata from Razorpay (plan, order ID — we never see your card or UPI details); technical data (device model, OS version, app version, IP address, crash logs); and the Firebase Cloud Messaging push token so we can deliver case alerts.',
  },
  {
    title: '3. What we do not collect',
    body: 'We do not collect your precise location, your contacts, your photos or files outside the ones you explicitly attach to a case, your microphone audio outside the explicit "record an audio description" flow, biometric data, or any data from children under 18.',
  },
  {
    title: '4. Why we use it',
    body: 'To create and run your account, assign and operate your legal case, deliver chat and document sharing, send transactional alerts (lawyer replied, session confirmed, document requested), process payments through Razorpay, detect fraud and abuse, and meet legal obligations. We do not use your case content to train AI, sell ads, or share with marketers.',
  },
  {
    title: '5. Who can see your data',
    body: 'You and the advocate assigned to your case. Platform admins for support, verification, and fraud prevention (bound by confidentiality). Processors acting on our instructions: Razorpay (payments & invoicing, India), Google Firebase (sign-in and push notifications), our cloud hosting provider, and our transactional email provider. Authorities if required by valid Indian law or a court order. We do not sell personal data.',
  },
  {
    title: '6. International transfers',
    body: 'Some processors (notably Google for Firebase Auth and FCM) operate servers outside India. We share only the minimum needed (e.g. a push token, not case content) and rely on the provider\'s contractual safeguards.',
  },
  {
    title: '7. How long we keep it',
    body: 'Account profile: while active and until a verified deletion request, except where retention is required by law. Case content (messages, documents, notes): while the case is open and up to 3 years after closure, longer if required by law or under a legal hold. Payment records and invoices: 8 years (Indian tax law). Security logs: up to 12 months. Push tokens: until you uninstall, log out, or disable notifications.',
  },
  {
    title: '8. How we keep it safe',
    body: 'HTTPS / TLS encryption in transit. Passwords (where applicable) stored as salted hashes. Role-based access control. Encrypted cloud storage. All card and UPI data handled inside Razorpay\'s PCI-DSS Level 1 environment. Audit logs on sensitive admin actions. If a breach affecting your data occurs, we will notify you and the Data Protection Board of India as required by the DPDP Act.',
  },
  {
    title: '9. Microphone and notifications',
    body: 'Microphone access is used only when you tap the mic button on the "Create case" screen to record an optional audio description. Nothing is recorded in the background. Push notifications are sent only for transactional events on your case (replies, document requests, session confirmations). You can turn them off in your device settings at any time.',
  },
  {
    title: '10. Your rights under the DPDP Act, 2023',
    body: 'Subject to the Act, you can request access to your data, correction of inaccurate data, erasure where we no longer need it (we may keep what we are legally required to keep), withdrawal of consent for consent-based processing, and nomination of someone to exercise your rights on your behalf. You can raise a grievance with our grievance officer and escalate to the Data Protection Board of India. Email grievance@samvidhanadvisory.com with "DPDP request" in the subject.',
  },
  {
    title: '11. Children',
    body: 'The Service is intended for users aged 18 and over. We do not knowingly collect personal data from children. If you believe a child has provided us data, contact us and we will remove it.',
  },
  {
    title: '12. Changes',
    body: 'We may update this policy. The "Last updated" date at the top changes when we publish a new version. If a change is material we will notify you in the app or by email before it takes effect.',
  },
  {
    title: '13. Contact',
    body: 'General queries: support@samvidhanadvisory.com. Privacy / DPDP rights: grievance@samvidhanadvisory.com. Website: https://samvidhanadvisory.com. Registered office: Shop No 12, Shiv Surbhi Apartment, Kandivali, Chikhal Wadi, Thakur Village, Kandivali East, Mumbai, Maharashtra 400101.',
  },
] as const;

const PrivacyPolicyPage = () => (
  <LegalDocPage
    title="Privacy policy"
    subtitle="Samvidhan Legal Advisory"
    lastUpdated="May 2026"
    icon={Lock}
    sections={sections}
    backTo={{ label: 'Back to home', href: ROUTES.home }}
  />
);

export default PrivacyPolicyPage;
