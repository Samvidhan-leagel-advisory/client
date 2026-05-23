import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/layouts/PublicLayout';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface LegalSection {
  title: string;
  body: string;
}

interface LegalDocPageProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  icon: LucideIcon;
  sections: readonly LegalSection[];
  backTo?: { label: string; href: string };
}

export function LegalDocPage({
  title,
  subtitle,
  lastUpdated,
  icon: Icon,
  sections,
  backTo,
}: LegalDocPageProps) {
  return (
    <PublicLayout>
      <section className="py-12 md:py-16">
        <article className="container max-w-2xl">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-gold/10">
            <Icon className="h-5 w-5 text-gold" aria-hidden />
          </div>

          <h1 className="mt-5 text-2xl font-bold sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">Last updated: {lastUpdated}</p>

          <div className="mt-10 space-y-6 text-sm leading-relaxed">
            {sections.map((s) => (
              <section key={s.title}>
                <h2 className="font-semibold text-foreground">{s.title}</h2>
                <p className="mt-1.5 text-muted-foreground">{s.body}</p>
              </section>
            ))}
          </div>

          {backTo ? (
            <div className="mt-10">
              <Button asChild variant="outline" size="sm">
                <Link to={backTo.href}>{backTo.label}</Link>
              </Button>
            </div>
          ) : null}
        </article>
      </section>
    </PublicLayout>
  );
}
