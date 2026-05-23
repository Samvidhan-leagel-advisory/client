import { caseDocumentRoleStyles } from '@/lib/case-document-role';
import { caseDocumentDisplayName } from '@/lib/case-document-utils';
import { getFileIcon } from '@/lib/helpers';
import type { CaseDocument } from '@/types';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { FileViewer } from './FileViewer';

interface DocumentListProps {
  documents: CaseDocument[];
  caseClientName?: string;
  caseLawyerName?: string;
}

export const DocumentList = ({
  documents,
  caseClientName,
  caseLawyerName,
}: DocumentListProps) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<CaseDocument | null>(null);

  const openDoc = (doc: CaseDocument) => {
    setSelectedDoc(doc);
    setViewerOpen(true);
  };

  return (
    <>
      <div className="space-y-2">
        {documents.map((d) => {
          const displayName = caseDocumentDisplayName(d);
          const isClient = d.author === 'user';
          const isLawyer = d.author === 'lawyer';
          const roleInfo = isClient
            ? caseDocumentRoleStyles.user
            : isLawyer
              ? caseDocumentRoleStyles.lawyer
              : caseDocumentRoleStyles.admin;

          return (
            <div
              key={d.id}
              className="group cursor-pointer rounded-lg bg-muted p-2.5 transition-colors hover:bg-muted/80"
              onClick={() => openDoc(d)}
            >
              <div className="flex items-center gap-2.5">
                {getFileIcon(displayName)}
                <span className="flex-1 truncate text-sm">{displayName}</span>
                <Eye className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="ml-6 mt-1.5 flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${roleInfo.bg}`}
                >
                  {roleInfo.label}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {isClient
                    ? caseClientName
                    : isLawyer
                      ? caseLawyerName
                      : 'Admin'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedDoc && (
        <FileViewer
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          fileName={caseDocumentDisplayName(selectedDoc)}
          fileUrl={selectedDoc.assetUrl}
        />
      )}
    </>
  );
};
