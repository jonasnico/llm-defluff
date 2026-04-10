/**
 * Split text into sentences. Handles common abbreviations and edge cases.
 * Returns array of { text, start, end } for positional stripping.
 */
export function splitSentences(
  text: string,
): { text: string; start: number; end: number }[] {
  const results: { text: string; start: number; end: number }[] = [];

  // text ending with sentence-terminal punctuation + space,
  // or the remaining tail of the string.
  const re = /[^.!?…]*[.!?…]+(?:\s+|$)|.+$/g;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    const raw = match[0];
    if (raw.trim().length === 0) continue;

    results.push({
      text: raw.trim(),
      start: match.index,
      end: match.index + raw.length,
    });
  }

  return results;
}

/**
 * Split on em-dashes and line breaks that commonly separate filler from content.
 * Returns sub-segments within a single sentence.
 */
export function splitOnPivot(sentence: string): string[] {
  return sentence
    .split(/\s*[—–]\s*|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}
