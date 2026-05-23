import { AdminCaseDocumentMedia } from '@/components/admin/AdminCaseDocumentMedia';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { caseDocumentRoleStyles } from '@/lib/case-document-role';
import {
  caseDocumentDisplayName,
  formatCaseDocumentRelativeTime,
} from '@/lib/case-document-utils';
import { cn } from '@/lib/utils';
import type { CaseDocument } from '@/types';
import { Eye } from 'lucide-react';

type Props = {
  document: CaseDocument;
  onView: (doc: CaseDocument) => void;
};

export function AdminCaseDocumentCard({ document: doc, onView }: Props) {
  const title = caseDocumentDisplayName(doc);
  const role =
    caseDocumentRoleStyles[doc.author] ?? caseDocumentRoleStyles.admin;

  return (
    <Card
      role="button"
      tabIndex={0}
      className={cn(
        'group cursor-pointer overflow-hidden p-0 shadow-sm transition-shadow'
      )}
      onClick={() => onView(doc)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onView(doc);
        }
      }}
    >
      <div className="relative">
        <AdminCaseDocumentMedia document={doc} />

        <Badge
          variant="outline"
          className={cn('absolute left-2 top-2 z-10 border shadow-sm', role.bg)}
        >
          {role.label}
        </Badge>

        <div className="absolute inset-0 z-20 flex items-center justify-center gap-1 bg-black/0 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              onView(doc);
            }}
            title="View"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="space-y-0.5 border-t border-border p-2 pt-2">
        <p className="truncate text-xs font-medium leading-tight" title={title}>
          {title}
        </p>
        <CardDescription className="truncate text-[11px] leading-tight">
          {formatCaseDocumentRelativeTime(doc.createdAt)}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
