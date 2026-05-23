import { BrandLogo } from '@/components/BrandLogo';

export function LoginBrandingAside() {
  const year = new Date().getFullYear();

  return (
    <div className="hidden flex-col justify-between bg-navy p-10 lg:flex lg:w-2/5">
      <BrandLogo size="lg" textVariant="sidebar" />
      <div>
        <h2 className="font-serif text-3xl font-bold leading-snug text-primary-foreground">
          Your legal rights,
          <br />
          <span className="text-gold">protected.</span>
        </h2>
        <p className="mt-4 max-w-sm text-sm text-primary-foreground/60">
          Access verified legal advocates, track your cases, and resolve disputes
          all in one place.
        </p>
      </div>
      <p className="text-xs text-primary-foreground/40">
        © {year} Samvidhan Legal Advisory
      </p>
    </div>
  );
}
