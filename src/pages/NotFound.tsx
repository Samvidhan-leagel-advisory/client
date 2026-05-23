import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { PublicLayout } from '@/layouts/PublicLayout';
import { ArrowLeft, Home } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const quickLinks = [
  { label: 'Home', to: ROUTES.home },
  { label: 'Case flow', to: '/#case-flow' },
  { label: 'About', to: ROUTES.about },
  { label: 'FAQ', to: ROUTES.faq },
  { label: 'Sign in', to: ROUTES.login },
] as const;

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      '404 Error: User attempted to access non-existent route:',
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PublicLayout>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 md:py-24">
        <div className="w-full max-w-lg rounded-2xl border bg-card px-6 py-10 text-center shadow-sm md:px-10 md:py-12">
          <div className="mb-8 flex justify-center">
            <BrandLogo size="xl" textVariant="header" />
          </div>

          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Page not found
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-navy md:text-4xl">
            We couldn’t find that page
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            The link may be wrong or the page was removed. Head back home or sign in to your
            dashboard.
          </p>

          {location.pathname !== '/' && (
            <p className="mt-3 break-all rounded-md bg-muted/80 px-3 py-2 font-mono text-xs text-muted-foreground">
              Requested:{' '}
              <span className="text-foreground/80">{location.pathname}</span>
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              className="bg-navy text-primary-foreground hover:bg-navy/90"
            >
              <Link to={ROUTES.home}>
                <Home className="mr-2 h-4 w-4" />
                Back to home
              </Link>
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back
            </Button>
          </div>

          <nav
            className="mt-10 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t pt-8 text-sm"
            aria-label="Helpful links"
          >
            {quickLinks.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="text-primary underline-offset-4 hover:text-primary/90 hover:underline"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </PublicLayout>
  );
};

export default NotFound;
