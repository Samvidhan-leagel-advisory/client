import { deleteAdminCaseNote } from '@/api-client';
import { CaseCodeText } from '@/components/CaseCodeText';
import { PaginationControls } from '@/components/PaginationControls';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useComposerEmojiInsert } from '@/hooks/use-composer-emoji-insert';
import { useToast } from '@/hooks/use-toast';
import { useInternalCaseNotes } from '@/hooks/useInternalCaseNotes';
import { getFirstLetterCapitalized } from '@/lib/helpers';
import { queryClient } from '@/lib/query-client';
import { cn, getApiErrorMessage } from '@/lib/utils';
import { CaseStatus } from '@/types';
import { useMutation } from '@tanstack/react-query';
import EmojiPicker from 'emoji-picker-react';
import {
  ArrowUp,
  Loader2,
  Lock,
  Smile,
  StickyNote,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

interface AdminCaseInternalNotesContentProps {
  caseStatus?: CaseStatus;
  caseCode?: string;
  /** `lawyer` uses case endpoints; same UI as admin. */
  notesVariant?: 'admin' | 'lawyer';
}

const INTERNAL_NOTE_MAX_LENGTH = 2000;
const NOTE_TEXTAREA_MAX_HEIGHT_PX = 140;

function formatNoteDate(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${date} at ${time}`;
}

export function AdminCaseInternalNotesContent({
  caseStatus,
  caseCode,
  notesVariant = 'admin',
}: AdminCaseInternalNotesContentProps) {
  const { id } = useParams();
  const { toast } = useToast();
  const isAdminNotes = notesVariant === 'admin';
  const isCaseClosed = caseStatus === 'closed' || caseStatus === 'rejected';
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (noteId: string) => deleteAdminCaseNote(noteId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['admin-case-notes', id],
      });
      toast({ title: 'Note deleted' });
      setPendingDeleteId(null);
    },
    onError: (error: unknown) => {
      toast({
        title: getApiErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const notesHookOptions =
    notesVariant === 'admin'
      ? ({ variant: 'admin' } as const)
      : ({ variant: 'lawyer', skipFetch: false } as const);

  const {
    noteText,
    setNoteText,
    page,
    setPage,
    handleAdd,
    isAddingNote,
    notes,
    totalPages,
    total,
  } = useInternalCaseNotes(id, notesHookOptions);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const autoGrow = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, NOTE_TEXTAREA_MAX_HEIGHT_PX)}px`;
  }, []);

  const resetTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
  }, []);

  const { emojiPickerOpen, setEmojiPickerOpen, insertEmoji } =
    useComposerEmojiInsert({
      textareaRef,
      inputRef,
      composer: 'textarea',
      draft: noteText,
      maxLength: INTERNAL_NOTE_MAX_LENGTH,
      onDraftChange: setNoteText,
      onAfterEmojiInsertTextarea: autoGrow,
    });

  useEffect(() => {
    if (!noteText) resetTextarea();
  }, [noteText, resetTextarea]);

  const canAddNote = !isCaseClosed && !isAddingNote && !!noteText.trim();

  const handleSubmitNote = () => {
    if (!canAddNote) return;
    handleAdd();
    resetTextarea();
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    await deleteMutation.mutateAsync(pendingDeleteId);
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-3">
      {/* Info / status strip */}
      <div
        className={cn(
          'flex shrink-0 flex-col gap-2 rounded-lg border px-3 py-2.5 text-xs sm:flex-row sm:items-center sm:gap-2 sm:py-2',
          isCaseClosed
            ? 'border-destructive/20 bg-destructive/5 text-destructive/80'
            : 'border-amber-200/80 bg-amber-50/80 text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-400'
        )}
      >
        <div className="flex min-w-0 flex-1 items-start gap-2 sm:items-center">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 sm:mt-0" />
          <span className="min-w-0 flex-1 leading-snug">
            {isCaseClosed
              ? 'Case closed — notes are locked and cannot be added.'
              : 'Private — visible only to admins and lawyers.'}
          </span>
        </div>
        {caseCode && (
          <CaseCodeText className="min-w-0 shrink whitespace-normal break-words pl-[calc(0.875rem+0.5rem)] font-medium opacity-80 sm:inline-block sm:max-w-[14rem] sm:shrink-0 sm:pl-0 sm:text-right sm:truncate sm:break-normal">
            {caseCode}
          </CaseCodeText>
        )}
      </div>

      {/* Notes list */}
      <div className="scrollbar-hide min-h-0 flex-1 space-y-2.5 overflow-y-auto py-1 pr-1">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
              <StickyNote className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No internal notes yet.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Notes are private and visible only to admins and lawyers.
            </p>
          </div>
        ) : (
          notes.map((n) => (
            <div
              key={n.id}
              className={cn(
                'rounded-lg border bg-card p-3.5 shadow-sm',
                n.author === 'lawyer'
                  ? 'border-l-2 border-l-amber-400'
                  : 'border-l-2 border-l-purple-400'
              )}
            >
              <div className="flex gap-2">
                <p className="min-w-0 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {n.note}
                </p>
                {isAdminNotes && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    aria-label="Delete note"
                    disabled={deleteMutation.isPending}
                    onClick={() => setPendingDeleteId(n.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium',
                    n.author === 'lawyer'
                      ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-400'
                      : 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800/50 dark:bg-purple-950/40 dark:text-purple-400'
                  )}
                >
                  {getFirstLetterCapitalized(n.author)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatNoteDate(n.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination + Composer */}
      <div className="shrink-0 space-y-2">
        <PaginationControls
          page={page}
          totalPages={totalPages}
          total={total}
          onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
          onPrev={() => setPage((p) => Math.max(p - 1, 1))}
          onPageChange={setPage}
          className="pt-0"
        />

        <div
          className={cn(
            'flex flex-col gap-0.5 rounded-[1.1rem] border p-2 shadow-sm transition-colors',
            isCaseClosed
              ? 'border-border/40 bg-muted/20 opacity-60'
              : 'border-border/70 bg-muted/30'
          )}
        >
          <Textarea
            ref={textareaRef}
            placeholder={
              isCaseClosed
                ? 'Case is closed. Notes are locked.'
                : 'Write an internal note…'
            }
            value={noteText}
            onChange={(e) => {
              setNoteText(e.target.value);
              autoGrow();
            }}
            style={{ maxHeight: NOTE_TEXTAREA_MAX_HEIGHT_PX }}
            className={cn(
              'scrollbar-hide min-h-[40px] w-full resize-none overflow-y-auto border-0 bg-transparent px-2.5 py-2 text-[15px] leading-snug shadow-none',
              'placeholder:text-muted-foreground/70',
              'focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
            )}
            rows={1}
            maxLength={INTERNAL_NOTE_MAX_LENGTH}
            disabled={isCaseClosed}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmitNote();
              }
            }}
          />
          <div className="flex items-center justify-between gap-2 px-0.5 pb-0.5 pt-1">
            <div className="flex min-w-0 flex-1 items-center gap-0.5 [&_button]:h-9 [&_button]:w-9 [&_button]:shrink-0 [&_button]:rounded-full">
              <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Insert emoji"
                    disabled={isCaseClosed}
                  >
                    <Smile className="h-5 w-5 stroke-[2]" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" side="top" className="w-auto p-0">
                  <EmojiPicker onEmojiClick={(d) => insertEmoji(d.emoji)} />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              {noteText.length > INTERNAL_NOTE_MAX_LENGTH - 200 && (
                <span
                  className={cn(
                    'text-[11px] tabular-nums',
                    noteText.length >= INTERNAL_NOTE_MAX_LENGTH
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                  )}
                >
                  {noteText.length}/{INTERNAL_NOTE_MAX_LENGTH}
                </span>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={!canAddNote}
                className={cn(
                  'h-9 w-9 shrink-0 rounded-full shadow-sm',
                  canAddNote
                    ? 'bg-foreground text-background hover:bg-foreground/90 hover:text-background'
                    : 'bg-muted/80 text-muted-foreground hover:bg-muted/80 hover:text-muted-foreground'
                )}
                onClick={handleSubmitNote}
                aria-label="Add note"
              >
                {isAddingNote ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4 stroke-[2.5]" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setPendingDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete internal note?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span>This cannot be undone. Lawyers cannot delete notes.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => void confirmDelete()}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
