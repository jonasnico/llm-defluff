// --- Opener signals ---

const AFFIRMATIONS =
  /^(sure|certainly|absolutely|of course|great|wonderful|excellent|definitely|happy to|glad to|i'd be happy|i'd love to|i would be happy)\b/i;

const META_COMMENTARY =
  /\b(here'?s|let me|i'll|i will|allow me|i can help|i'd be happy to help|let's)\b/i;

const PIVOT_TRAIL = /[!—–\-:]\s*$/;

// --- Closer signals ---

const OFFER_PATTERNS =
  /\b(let me know|feel free|don't hesitate|do not hesitate|hope (that |this )?helps|happy to help|if you (need|have|want)|anything else|further (assistance|questions|help))\b/i;

const SECOND_PERSON = /\b(you|your|you're|you've)\b/i;

/**
 * Score how likely a sentence is to be an opener filler (0–1).
 */
export function scoreOpener(sentence: string): number {
  const trimmed = sentence.trim();
  if (trimmed.length === 0) return 0;

  const words = trimmed.split(/\s+/);
  let score = 0;

  if (AFFIRMATIONS.test(trimmed)) score += 0.45;

  if (META_COMMENTARY.test(trimmed)) score += 0.25;

  if (words.length <= 4 && !/\d/.test(trimmed)) score += 0.1;

  if (words.length <= 15) score += 0.1;

  if (!/\d/.test(trimmed)) score += 0.1;

  const inner = words.slice(1);
  const hasEntities = inner.some((w) => /^[A-Z][a-z]/.test(w) && !/^I$/.test(w));
  if (!hasEntities) score += 0.05;

  if (PIVOT_TRAIL.test(trimmed)) score += 0.1;

  return round(Math.min(score, 1));
}

/**
 * Score how likely a sentence is to be a closer filler (0–1).
 */
export function scoreCloser(sentence: string): number {
  const trimmed = sentence.trim();
  if (trimmed.length === 0) return 0;

  const words = trimmed.split(/\s+/);
  let score = 0;

  if (OFFER_PATTERNS.test(trimmed)) score += 0.4;
  if (SECOND_PERSON.test(trimmed)) score += 0.2;
  if (!/\d/.test(trimmed)) score += 0.1;

  const inner = words.slice(1);
  const hasEntities = inner.some((w) => /^[A-Z][a-z]/.test(w) && !/^I$/.test(w));
  if (!hasEntities) score += 0.1;

  if (words.length <= 20) score += 0.1;
  if (/[?!]$/.test(trimmed)) score += 0.1;

  return round(Math.min(score, 1));
}

/** Round to 2 decimal places to avoid floating-point comparison issues. */
function round(n: number): number {
  return Math.round(n * 100) / 100;
}
