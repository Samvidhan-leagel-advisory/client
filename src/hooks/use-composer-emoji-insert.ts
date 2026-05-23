import type { RefObject } from 'react';
import { useCallback, useState } from 'react';

type ComposerKind = 'textarea' | 'input';

export function useComposerEmojiInsert(options: {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  composer: ComposerKind;
  draft: string;
  maxLength: number;
  onDraftChange: (value: string) => void;
  /** Runs after insert when `composer === 'textarea'` (e.g. `autoGrow`). */
  onAfterEmojiInsertTextarea?: () => void;
}) {
  const {
    textareaRef,
    inputRef,
    composer,
    draft,
    maxLength,
    onDraftChange,
    onAfterEmojiInsertTextarea,
  } = options;

  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const insertEmoji = useCallback(
    (emoji: string) => {
      if (draft.length + emoji.length > maxLength) return;
      const el = composer === 'textarea' ? textareaRef.current : inputRef.current;
      const start =
        el && typeof el.selectionStart === 'number' ? el.selectionStart : draft.length;
      const end = el && typeof el.selectionEnd === 'number' ? el.selectionEnd : start;
      const next = draft.slice(0, start) + emoji + draft.slice(end);
      const caret = start + emoji.length;
      onDraftChange(next);
      setEmojiPickerOpen(false);
      window.setTimeout(() => {
        const focusEl = composer === 'textarea' ? textareaRef.current : inputRef.current;
        focusEl?.focus();
        focusEl?.setSelectionRange(caret, caret);
        if (composer === 'textarea') onAfterEmojiInsertTextarea?.();
      }, 0);
    },
    [
      composer,
      draft,
      maxLength,
      onDraftChange,
      onAfterEmojiInsertTextarea,
      textareaRef,
      inputRef,
    ]
  );

  return { emojiPickerOpen, setEmojiPickerOpen, insertEmoji };
}
