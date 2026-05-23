import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState = ({ icon, title, description, action }: Props) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 rounded-full bg-muted p-4 text-muted-foreground">
      {icon || <FolderOpen className="h-8 w-8" />}
    </div>
    <h3 className="mb-1 text-lg font-semibold">{title}</h3>
    <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
    {action && <Button onClick={action.onClick}>{action.label}</Button>}
  </div>
);
