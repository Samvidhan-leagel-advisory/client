import { getAdminSettings } from '@/api-client';
import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';
import { PUBLIC_NAV_LINKS, ROUTES } from '@/constants';
import { Menu, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [settings, setSettings] = useState(null);

  const getSettings = useCallback(async () => {
    const response = await getAdminSettings();
    setSettings(response.data);
  }, []);

  useEffect(() => {
    void getSettings();
  }, [getSettings]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-16 items-center justify-between">
          <BrandLogo size="md" textVariant="header" />

          <nav className="hidden items-center gap-1 md:flex">
            {PUBLIC_NAV_LINKS.map((l) =>
              l.to.includes('#') ? (
                <a
                  key={l.to}
                  href={l.to}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${location.pathname === l.to ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  {l.label}
                </Link>
              )
            )}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button asChild>
              <Link to={ROUTES.login}>Log In</Link>
            </Button>
          </div>

          <button
            className="p-2 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t bg-card p-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {PUBLIC_NAV_LINKS.map((l) =>
                l.to.includes('#') ? (
                  <a
                    key={l.to}
                    href={l.to}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-md px-3 py-2.5 text-sm font-medium ${location.pathname === l.to ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
                  >
                    {l.label}
                  </Link>
                )
              )}
              <div className="mt-3 flex flex-col gap-2 pt-3">
                <Button variant="default" asChild>
                  <Link to={ROUTES.login}>Log In</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-navy text-primary-foreground">
        <div className="container py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4">
                <BrandLogo size="sm" textVariant="footer" />
              </div>
              <p className="text-sm text-primary-foreground/70">
                Bridging the gap between citizens and legal support across
                India.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gold">Platform</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                <li>
                  <Link
                    to={ROUTES.home}
                    className="hover:text-primary-foreground"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to={ROUTES.faq}
                    className="hover:text-primary-foreground"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <a
                    href="/#case-flow"
                    className="hover:text-primary-foreground"
                  >
                    Case flow
                  </a>
                </li>
                <li>
                  <Link
                    to={ROUTES.about}
                    className="hover:text-primary-foreground"
                  >
                    About
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gold">Legal</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                <li>
                  <Link
                    to={ROUTES.terms}
                    className="hover:text-primary-foreground"
                  >
                    Terms & conditions
                  </Link>
                </li>
                <li>
                  <Link
                    to={ROUTES.dpdpConsent}
                    className="hover:text-primary-foreground"
                  >
                    DPDP consent
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gold">Contact</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                <li>{settings?.supportEmail}</li>
                <li>{settings?.supportPhone}</li>
                <li>New Delhi, India</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} Samvidhan Legal Advisory. All rights
            reserved. An initiative towards accessible legal aid in India.
          </div>
        </div>
      </footer>
    </div>
  );
};
