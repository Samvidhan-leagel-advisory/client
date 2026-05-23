import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ROUTES } from '@/constants';
import { PublicLayout } from '@/layouts/PublicLayout';
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Briefcase,
  Clock,
  FileText,
  FolderOpen,
  Gavel,
  MessageSquare,
  Scale,
  Shield,
  Upload,
  UserCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: BadgeCheck,
    title: 'Verified advocates',
    desc: 'Every lawyer is checked against Bar Council registration before joining the network.',
  },
  {
    icon: Briefcase,
    title: 'Case management',
    desc: 'Open matters, track status, and keep everything related to one issue in a single workspace.',
  },
  {
    icon: Shield,
    title: 'Secure documents',
    desc: 'Upload notices, agreements, and evidence. Share them only with your assigned advocate.',
  },
  {
    icon: MessageSquare,
    title: 'Case chat',
    desc: 'Message your lawyer inside the case—no scattered WhatsApp or email threads.',
  },
  {
    icon: Clock,
    title: 'Timely updates',
    desc: 'See when your case is reviewed, assigned, or needs your input.',
  },
  {
    icon: Bell,
    title: 'Notifications',
    desc: 'Get alerts for new messages and important case activity.',
  },
];

/** End-to-end flow after sign-in (matches the product). */
const caseFlowSteps = [
  {
    icon: UserCheck,
    title: 'Sign in & consent',
    desc: 'Sign in with Google, accept the DPDP notice and terms, then land on your dashboard.',
  },
  {
    icon: Scale,
    title: 'Subscription (if required)',
    desc: 'Active subscription unlocks new cases. You can view or manage plans from your dashboard.',
  },
  {
    icon: FileText,
    title: 'Raise a new case',
    desc: 'Pick a legal category, add a short title and detailed description, and mark urgent matters if needed.',
  },
  {
    icon: Upload,
    title: 'Attach documents',
    desc: 'Upload PDFs, images, or other files so your advocate has context from day one.',
  },
  {
    icon: Gavel,
    title: 'Review & assignment',
    desc: 'Our team reviews your request and assigns a verified advocate suited to your category.',
  },
  {
    icon: MessageSquare,
    title: 'Consult & follow up',
    desc: 'Use case chat to ask questions, share updates, and receive guidance on next steps.',
  },
  {
    icon: FolderOpen,
    title: 'Documents & status',
    desc: 'Open the case anytime to see status, files, and message history until the matter progresses.',
  },
];

const legalHighlights = [
  {
    title: 'DPDP consent',
    summary:
      'We explain what personal and case data we collect, why we use it, who can access it (your advocate and platform admins), and your rights under India’s DPDP Act, 2023.',
    to: ROUTES.dpdpConsent,
    cta: 'Read full DPDP notice',
    icon: Shield,
  },
  {
    title: 'Terms & conditions',
    summary:
      'Covers how the platform works, your responsibilities when submitting cases, subscriptions, advocate relationships, and limits of our service.',
    to: ROUTES.terms,
    cta: 'Read full terms',
    icon: Scale,
  },
];

const faqs = [
  {
    q: 'What is Samvidhan Legal Advisory?',
    a: 'An online platform to open legal cases, upload documents, and work with verified advocates—without visiting multiple offices for every update.',
  },
  {
    q: 'How does the case flow work?',
    a: 'Sign in → (subscribe if needed) → New Case → fill category, title, description, files → we assign a lawyer → you chat and track status on the case page.',
  },
  {
    q: 'Is my case information private?',
    a: 'Yes. Case data is shared with your assigned advocate and platform staff only for verification and support. Details are in our DPDP notice.',
  },
  {
    q: 'Do I need to accept DPDP and terms?',
    a: 'Yes. You must accept both at login before using the platform. Links are on this page and on the sign-in screen.',
  },
  {
    q: 'Can I upload documents with my case?',
    a: 'Yes. When raising a case you can attach relevant files so your advocate can review them securely.',
  },
  {
    q: 'How do I start?',
    a: 'Click Sign in, complete consent, then use “New Case” from your dashboard.',
  },
];

const Homepage = () => (
  <PublicLayout>
    {/* Hero */}
    <section className="relative overflow-hidden bg-navy">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(43_55%_52%_/_0.12),_transparent_60%)]" />
      <div className="container relative py-14 md:py-20">
        <BrandLogo as="div" showText={false} size={56} className="gap-0" />
        <h1 className="mt-6 max-w-2xl text-3xl font-bold leading-tight text-primary-foreground sm:text-4xl md:text-5xl">
          Manage legal cases with verified advocates,{' '}
          <span className="text-gold">in one place</span>
        </h1>
        <p className="mt-4 max-w-2xl text-primary-foreground/75 sm:text-lg">
          Samvidhan Legal Advisory helps you open a matter, share documents, message your
          lawyer, and track progress—built for how legal work actually happens in India.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            size="lg"
            className="bg-gold text-accent-foreground hover:bg-gold/90"
            asChild
          >
            <Link to={ROUTES.login}>
              Sign in <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/25 text-primary-background hover:bg-primary-foreground/10"
            asChild
          >
            <a href="#case-flow">See case flow</a>
          </Button>
        </div>
        <nav
          className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm text-primary-foreground/60"
          aria-label="On this page"
        >
          <a href="#features" className="hover:text-primary-foreground">
            Features
          </a>
          <a href="#case-flow" className="hover:text-primary-foreground">
            Case flow
          </a>
          <a href="#legal" className="hover:text-primary-foreground">
            Terms & DPDP
          </a>
          <a href="#faq" className="hover:text-primary-foreground">
            FAQ
          </a>
          <Link to={ROUTES.about} className="hover:text-primary-foreground">
            About
          </Link>
        </nav>
      </div>
    </section>

    {/* Features */}
    <section id="features" className="scroll-mt-20 py-12 md:py-16">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Built for real legal cases</h2>
          <p className="mt-2 text-muted-foreground">
            Everything you need after sign-in—from filing a query to working with your advocate.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border bg-card p-5 shadow-sm"
            >
              <f.icon className="mb-3 h-5 w-5 text-gold" aria-hidden />
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Case flow */}
    <section id="case-flow" className="scroll-mt-20 bg-muted/40 py-12 md:py-16">
      <div className="container max-w-3xl">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">How the case flow works</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          From your first sign-in to ongoing work with your advocate—step by step on the platform.
        </p>
        <ol className="mt-10 space-y-5">
          {caseFlowSteps.map((step, i) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-xl border bg-card p-5 shadow-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-gold">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <step.icon className="h-4 w-4 shrink-0 text-gold" aria-hidden />
                  <h3 className="font-semibold">{step.title}</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to={ROUTES.login}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in to open a case
          </Link>
        </p>
      </div>
    </section>

    {/* Terms & DPDP on homepage */}
    <section id="legal" className="scroll-mt-20 py-12 md:py-16">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Terms & data protection</h2>
          <p className="mt-2 text-muted-foreground">
            We process personal and case-related data to run the service. You must accept both
            documents when you sign in.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
          {legalHighlights.map((doc) => (
            <div
              key={doc.title}
              className="flex flex-col rounded-xl border bg-card p-6 shadow-sm"
            >
              <doc.icon className="h-6 w-6 text-gold" aria-hidden />
              <h3 className="mt-4 font-semibold">{doc.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {doc.summary}
              </p>
              <Button variant="outline" size="sm" className="mt-5 w-fit" asChild>
                <Link to={doc.to}>
                  {doc.cta} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* FAQ */}
    <section id="faq" className="scroll-mt-20 bg-muted/30 py-12 md:py-16">
      <div className="container max-w-2xl">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">Common questions</h2>
        <Accordion type="single" collapsible className="mt-8">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.q} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-sm font-medium">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            to={ROUTES.faq}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            View all FAQ
          </Link>
          {' · '}
          <Link
            to={ROUTES.about}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            About us
          </Link>
        </p>
      </div>
    </section>

    {/* CTA */}
    <section className="bg-navy py-12 md:py-16">
      <div className="container text-center">
        <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl">
          Start your case today
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-primary-foreground/70">
          Sign in, accept terms and DPDP consent, and raise your first legal query from the
          dashboard.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-primary-foreground/60">
          <Link to={ROUTES.terms} className="hover:text-primary-foreground">
            Terms
          </Link>
          <span aria-hidden>·</span>
          <Link to={ROUTES.dpdpConsent} className="hover:text-primary-foreground">
            DPDP notice
          </Link>
        </div>
        <Button
          size="lg"
          className="mt-8 bg-gold text-accent-foreground hover:bg-gold/90"
          asChild
        >
          <Link to={ROUTES.login}>
            Sign in <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  </PublicLayout>
);

export default Homepage;
