import type { DefluffOptions } from "./types.js";
import { scoreOpener, scoreCloser } from "./heuristics.js";
import { splitSentences, splitOnPivot } from "./sentences.js";

const DEFAULT_THRESHOLD = 0.8;

/**
 * Strip filler preambles (and optionally closers) from an LLM response.
 *
 * @example
 * ```ts
 * defluff("Great question! The answer is 42.")
 * // → "The answer is 42."
 *
 * defluff("The answer is 42. Let me know if you need help!", { closers: true })
 * // → "The answer is 42."
 * ```
 */
export function defluff(input: string, options: DefluffOptions = {}): string {
  const {
    openers = true,
    closers = false,
    threshold = DEFAULT_THRESHOLD,
  } = options;

  let result = input;

  if (openers) {
    result = stripOpeners(result, threshold);
  }

  if (closers) {
    result = stripClosers(result, threshold);
  }

  return result;
}

function stripOpeners(text: string, threshold: number): string {
  const sentences = splitSentences(text);
  let stripUntil = 0;

  for (const sentence of sentences) {
    if (scoreOpener(sentence.text) >= threshold) {
      stripUntil = sentence.end;
      continue;
    }

    const parts = splitOnPivot(sentence.text);
    if (parts.length > 1) {
      const firstPart = parts[0];
      if (scoreOpener(firstPart) >= threshold) {
        const pivotContent = parts.slice(1).join(" — ");
        const pivotIndex = text.indexOf(pivotContent, sentence.start);
        if (pivotIndex !== -1) {
          stripUntil = pivotIndex;
        }
      }
    }

    break;
  }

  return text.slice(stripUntil).trimStart();
}

function stripClosers(text: string, threshold: number): string {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return text;

  let keepUntil = text.length;

  for (let i = sentences.length - 1; i >= 0; i--) {
    if (scoreCloser(sentences[i].text) >= threshold) {
      keepUntil = sentences[i].start;
      continue;
    }
    break;
  }

  return text.slice(0, keepUntil).trimEnd();
}
