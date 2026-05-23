export function LoginOAuthDivider() {
  return (
    <div className="mt-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">or sign in with email</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
