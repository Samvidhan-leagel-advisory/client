import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/constants';
import type { LoginEmailAuth } from '@/hooks/use-login-email-auth';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LoginEmailPasswordFormProps {
  auth: LoginEmailAuth;
}

export function LoginEmailPasswordForm({ auth }: LoginEmailPasswordFormProps) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPw,
    setShowPw,
    loading,
    submit,
  } = auth;

  return (
    <form onSubmit={submit} className="mt-5 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            to={ROUTES.forgotPassword}
            className="text-xs text-gold hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPw ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
