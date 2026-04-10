export interface DefluffOptions {
  /** Strip filler openers (default: true) */
  openers?: boolean;
  /** Strip filler closers — one-shot only (default: false) */
  closers?: boolean;
  /** Confidence required to strip, 0–1 (default: 0.8) */
  threshold?: number;
}

export interface StreamOptions {
  /** Confidence required to strip, 0–1 (default: 0.8) */
  threshold?: number;
}

export type StripperState =
  | "buffering"
  | "stripping"
  | "flushing"
  | "passthrough";
