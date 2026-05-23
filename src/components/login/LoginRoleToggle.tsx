import { cn } from '@/lib/utils';
import { Scale, User } from 'lucide-react';

export type LoginRole = 'user' | 'lawyer';

const ROLES: LoginRole[] = ['user', 'lawyer'];

export function parseLoginRole(value: string | null): LoginRole {
  return value === 'lawyer' ? 'lawyer' : 'user';
}

/** Login URL for a role — used before full page reload on toggle. */
export function loginUrlForRole(role: LoginRole, basePath = '/login'): string {
  if (role === 'lawyer') return `${basePath}?role=lawyer`;
  return basePath;
}

interface LoginRoleToggleProps {
  value: LoginRole;
  onChange: (role: LoginRole) => void;
}

export function LoginRoleToggle({ value, onChange }: LoginRoleToggleProps) {
  return (
    <div className="mt-6 flex rounded-lg border bg-muted p-1">
      {ROLES.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={cn(
            'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
            value === r
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <span className="flex items-center justify-center gap-2">
            {r === 'user' ? (
              <User className="h-4 w-4" aria-hidden />
            ) : (
              <Scale className="h-4 w-4" aria-hidden />
            )}
            <span>{r === 'user' ? 'Client' : 'Advocate'}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
