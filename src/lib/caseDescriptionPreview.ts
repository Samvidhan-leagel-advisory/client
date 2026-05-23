export const DESCRIPTION_PREVIEW_MAX_WORDS = 180;

export function splitWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

export function truncateToWords(text: string, maxWords: number): string {
  const words = splitWords(text);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(' ')}…`;
}
