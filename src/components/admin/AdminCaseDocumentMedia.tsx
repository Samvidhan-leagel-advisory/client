import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  caseDocumentDisplayName,
  caseDocumentShortExtensionLabel,
  isCaseDocumentImage,
} from '@/lib/case-document-utils';
import { getFileIcon, getFileType } from '@/lib/helpers';
import type { CaseDocument } from '@/types';

type Props = { document: CaseDocument };

export function AdminCaseDocumentMedia({ document: doc }: Props) {
  const fileName = caseDocumentDisplayName(doc);
  const isImage = isCaseDocumentImage(fileName, doc.assetType);
  const isPdf = getFileType(fileName) === 'pdf';

  return (
    <AspectRatio ratio={1} className="bg-muted">
      {isImage ? (
        <img
          src={doc.assetUrl}
          alt={fileName}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : isPdf ? (
        <div className="relative h-full w-full overflow-hidden bg-muted">
          <iframe
            src={`${doc.assetUrl}#toolbar=0&navpanes=0`}
            title=""
            className="pointer-events-none absolute left-0 top-0 h-[240%] min-w-full border-0 bg-white"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-muted via-muted/90 to-transparent py-1 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-red-600">
              PDF
            </span>
          </div>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
          <span className="scale-125">{getFileIcon(fileName)}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider">
            {caseDocumentShortExtensionLabel(fileName)}
          </span>
        </div>
      )}
    </AspectRatio>
  );
}
