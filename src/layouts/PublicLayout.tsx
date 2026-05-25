import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';
import { PUBLIC_NAV_LINKS, ROUTES } from '@/constants';
import {
  usePublicHomeNav,
  useScrollToStateSection,
} from '@/hooks/use-public-home-nav';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinkClass = (active: boolean) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${
    active ? 'text-foreground' : 'text-muted-foreground'
  }`;

export const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isOnHome, onHomeLinkClick, scrollToSection } = usePublicHomeNav();
  useScrollToStateSection();

  useEffect(() => {
    const scrollTarget = (location.state as { scrollTo?: string } | null)
      ?.scrollTo;
    if (scrollTarget) return;
    window.scrollTo(0, 0);
  }, [location.pathname, location.state]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-16 items-center justify-between">
          <BrandLogo size="md" textVariant="header" />

          <nav className="hidden items-center gap-1 md:flex">
            {PUBLIC_NAV_LINKS.map((l) => {
              if (l.kind === 'home') {
                return (
                  <Link
                    key="home"
                    to={ROUTES.home}
                    onClick={onHomeLinkClick}
                    className={navLinkClass(isOnHome)}
                  >
                    {l.label}
                  </Link>
                );
              }
              if (l.kind === 'section') {
                return (
                  <button
                    key={l.sectionId}
                    type="button"
                    onClick={(e) => scrollToSection(l.sectionId, e)}
                    className={navLinkClass(false)}
                  >
                    {l.label}
                  </button>
                );
              }
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={navLinkClass(location.pathname === l.to)}
                >
                  {l.label}
                </Link>
              );
            })}
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
              {PUBLIC_NAV_LINKS.map((l) => {
                const close = () => setMobileOpen(false);
                if (l.kind === 'home') {
                  return (
                    <Link
                      key="home"
                      to={ROUTES.home}
                      onClick={(e) => {
                        onHomeLinkClick(e);
                        close();
                      }}
                      className={`rounded-md px-3 py-2.5 text-sm font-medium ${isOnHome ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
                    >
                      {l.label}
                    </Link>
                  );
                }
                if (l.kind === 'section') {
                  return (
                    <button
                      key={l.sectionId}
                      type="button"
                      onClick={(e) => {
                        scrollToSection(l.sectionId, e);
                        close();
                      }}
                      className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-muted-foreground"
                    >
                      {l.label}
                    </button>
                  );
                }
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={close}
                    className={`rounded-md px-3 py-2.5 text-sm font-medium ${location.pathname === l.to ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
                  >
                    {l.label}
                  </Link>
                );
              })}
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
                    onClick={onHomeLinkClick}
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
                  <button
                    type="button"
                    onClick={(e) => scrollToSection('case-flow', e)}
                    className="text-left hover:text-primary-foreground"
                  >
                    Case flow
                  </button>
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
                <li>+91 9152921212</li>
                <li>
                  Shop No 12, Shiv Surbhi Apartment, Kandivali, Chikhal Wadi,
                  Thakur Village, Kandivali East, Mumbai, Maharashtra 400101
                </li>
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
