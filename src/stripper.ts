import type { StreamOptions, StripperState } from "./types.js";
import { scoreOpener } from "./heuristics.js";
import { splitSentences, splitOnPivot } from "./sentences.js";

const DEFAULT_THRESHOLD = 0.8;

/**
 * Streaming defluffer. Buffers the opening of an LLM stream, decides whether
 * it's filler, then either discards it or flushes it.
 *
 * After the opener is resolved, all subsequent chunks pass through with zero overhead.
 *
 * @example
 * ```ts
 * const stripper = createStripper()
 *
 * for await (const chunk of stream) {
 *   const out = stripper.push(chunk)
 *   if (out) process.stdout.write(out)
 * }
 * // Flush any remaining buffered content
 * const remaining = stripper.flush()
 * if (remaining) process.stdout.write(remaining)
 * ```
 */
export function createStripper(options: StreamOptions = {}) {
  const threshold = options.threshold ?? DEFAULT_THRESHOLD;

  let state: StripperState = "buffering";
  let buffer = "";

  function push(chunk: string): string | null {
    if (state === "passthrough") {
      return chunk;
    }

    buffer += chunk;

    if (state === "buffering") {
      const sentences = splitSentences(buffer);

      if (sentences.length < 1) return null;

      const lastSentence = sentences[sentences.length - 1];
      const hasCompleteSentence =
        sentences.length > 1 || /[.!?…]\s*$/.test(lastSentence.text);

      if (!hasCompleteSentence) return null;

      state = "stripping";
    }

    return evaluateBuffer();
  }

  function evaluateBuffer(): string | null {
    const sentences = splitSentences(buffer);
    let stripUntil = 0;
    let resolved = false;

    for (const sentence of sentences) {
      const isComplete = /[.!?…]\s*$/.test(sentence.text);

      if (!isComplete) {
        break;
      }

      if (scoreOpener(sentence.text) >= threshold) {
        stripUntil = sentence.end;
        continue;
      }

      const parts = splitOnPivot(sentence.text);
      if (parts.length > 1 && scoreOpener(parts[0]) >= threshold) {
        const pivotContent = parts.slice(1).join(" — ");
        const pivotIndex = buffer.indexOf(pivotContent, sentence.start);
        if (pivotIndex !== -1) {
          stripUntil = pivotIndex;
        }
      }

      resolved = true;
      break;
    }

    if (!resolved) {
      // All complete sentences so far are filler, but there may be more coming.
      // Stay in stripping state and wait for more data.
      return null;
    }

    const cleaned = buffer.slice(stripUntil).trimStart();
    state = "passthrough";
    buffer = "";

    return cleaned || null;
  }

  /**
   * Call when the stream ends to flush any remaining buffered content.
   */
  function flush(): string | null {
    if (state === "passthrough") return null;

    if (buffer.length === 0) return null;

    const sentences = splitSentences(buffer);
    let stripUntil = 0;

    for (const sentence of sentences) {
      if (scoreOpener(sentence.text) >= threshold) {
        stripUntil = sentence.end;
        continue;
      }

      const parts = splitOnPivot(sentence.text);
      if (parts.length > 1 && scoreOpener(parts[0]) >= threshold) {
        const pivotContent = parts.slice(1).join(" — ");
        const pivotIndex = buffer.indexOf(pivotContent, sentence.start);
        if (pivotIndex !== -1) {
          stripUntil = pivotIndex;
        }
      }
      break;
    }

    const cleaned = buffer.slice(stripUntil).trimStart();
    state = "passthrough";
    buffer = "";

    return cleaned || null;
  }

  /** Current state of the streaming state machine. */
  function getState(): StripperState {
    return state;
  }

  return { push, flush, getState };
}
