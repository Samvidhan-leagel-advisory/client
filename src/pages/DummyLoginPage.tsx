import { dummyLogin } from '@/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ROUTES, dashboardForRole } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import { setCookie } from '@/lib/helpers';
import type { UserRole } from '@/types';
import { Loader2, ShieldCheck, Scale, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ROLE_OPTIONS: Array<{
  role: UserRole;
  label: string;
  description: string;
  Icon: typeof User;
}> = [
  {
    role: 'user',
    label: 'Login as User',
    description: 'Signs in as dummy.user@test.local',
    Icon: User,
  },
  {
    role: 'lawyer',
    label: 'Login as Lawyer',
    description: 'Signs in as dummy.lawyer@test.local (auto-verified)',
    Icon: Scale,
  },
  {
    role: 'admin',
    label: 'Login as Admin',
    description: 'Signs in as dummy.admin@test.local',
    Icon: ShieldCheck,
  },
];

/**
 * DEV-ONLY login shortcut for environments where Google SSO is blocked.
 * Backend endpoint is disabled in production.
 */
const DummyLoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);

  const handleLogin = async (role: UserRole) => {
    setPendingRole(role);
    try {
      const { data } = await dummyLogin({ role });
      if (!data?.status) {
        throw new Error(data?.message || 'Dummy login failed');
      }

      const activeRole: UserRole = data.isAdmin ? 'admin' : role;
      setCookie('x-active-role', activeRole);

      toast({
        title: 'Signed in',
        description: `Logged in as dummy ${activeRole}.`,
      });

      navigate(activeRole === 'admin' ? ROUTES.admin.dashboard : dashboardForRole(activeRole));
    } catch (e) {
      toast({
        title: 'Dummy login failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setPendingRole(null);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Dummy Login</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Dev shortcut. Google SSO bypass. Pick a role to sign in instantly.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {ROLE_OPTIONS.map(({ role, label, description, Icon }) => {
            const isPending = pendingRole === role;
            return (
              <Button
                key={role}
                type="button"
                variant="outline"
                size="lg"
                disabled={pendingRole !== null}
                onClick={() => handleLogin(role)}
                className="h-auto justify-start gap-3 px-4 py-3 text-left"
              >
                {isPending ? (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
                ) : (
                  <Icon className="h-5 w-5 shrink-0" />
                )}
                <span className="flex flex-col">
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {description}
                  </span>
                </span>
              </Button>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          For testing only. Disabled in production.
        </p>
      </Card>
    </div>
  );
};

export default DummyLoginPage;
