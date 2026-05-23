import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ROUTES } from '@/constants';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Link } from 'react-router-dom';

const faqs = [
  {
    q: 'What is Samvidhan Legal Advisory?',
    a: 'A platform to open legal cases, share documents, and work with verified advocates online.',
  },
  {
    q: 'How are lawyers verified?',
    a: 'We check Bar Council registration and identity documents before advocates join the network.',
  },
  {
    q: 'Is my data secure?',
    a: 'We use encryption and access controls. See the DPDP consent notice for how case data is handled.',
  },
  {
    q: 'How do I start a case?',
    a: 'Sign in, accept the consent at login, then use “New Case” on your dashboard.',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Yes. Access continues until the end of your current billing period.',
  },
];

const FAQPage = () => (
  <PublicLayout>
    <section className="py-12 md:py-16">
      <div className="container max-w-xl">
        <h1 className="text-center text-2xl font-bold sm:text-3xl">FAQ</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Short answers about using the platform.{' '}
          <Link to={ROUTES.home} className="text-foreground underline-offset-4 hover:underline">
            Back to home
          </Link>
        </p>

        <Accordion type="single" collapsible className="mt-8">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.q} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-sm font-medium">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  </PublicLayout>
);

export default FAQPage;
