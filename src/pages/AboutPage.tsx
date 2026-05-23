import { BrandLogo } from '@/components/BrandLogo';
import { ROUTES } from '@/constants';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => (
  <PublicLayout>
    <section className="py-12 md:py-16">
      <div className="container max-w-2xl">
        <h1 className="text-2xl font-bold sm:text-3xl">About Samvidhan Legal Advisory</h1>
        <p className="mt-3 text-muted-foreground">
          We connect Indian citizens with verified advocates through a simple online case
          workspace, so legal help is easier to access, not harder to find.
        </p>

        <div className="mt-10 space-y-8">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10">
              <BrandLogo as="div" showText={false} size={32} className="gap-0" />
            </div>
            <div>
              <h2 className="font-semibold">Our mission</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Make quality legal support reachable regardless of city or background. You manage
                cases, documents, and messages in one place; we handle verification and matching.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10">
              <Shield className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h2 className="font-semibold">Trust & data protection</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Advocates are Bar Council verified. Your case data is handled under our{' '}
                <Link to={ROUTES.dpdpConsent} className="font-medium text-foreground underline-offset-4 hover:underline">
                  DPDP notice
                </Link>
                . Read our{' '}
                <Link to={ROUTES.terms} className="font-medium text-foreground underline-offset-4 hover:underline">
                  terms
                </Link>{' '}
                before signing in.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10">
              <Users className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h2 className="font-semibold">Practice areas</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Civil, criminal, family, property, consumer, corporate, and more. Choose a category
                when you open a case and we match you with a suitable advocate.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          <Link to={ROUTES.home} className="font-medium text-foreground underline-offset-4 hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </section>
  </PublicLayout>
);

export default AboutPage;
