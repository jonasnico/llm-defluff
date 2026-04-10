import { describe, it, expect } from "vitest";
import { defluff } from "../src/defluff.js";

describe("defluff — openers", () => {
  it("strips a classic preamble", () => {
    expect(defluff("Great question! The answer is 42.")).toBe(
      "The answer is 42.",
    );
  });

  it("strips multi-sentence preamble", () => {
    expect(
      defluff(
        "Sure thing! I'd be happy to help you with that. The capital of France is Paris.",
      ),
    ).toBe("The capital of France is Paris.");
  });

  it("handles partial filler with em-dash pivot", () => {
    expect(defluff("Great question — the answer is 42.")).toBe(
      "the answer is 42.",
    );
  });

  it("preserves legitimate content that starts with filler-adjacent words", () => {
    expect(
      defluff("Certainly, the French Revolution began in 1789."),
    ).toBe("Certainly, the French Revolution began in 1789.");
  });

  it("returns original when no filler detected", () => {
    const input = "The mitochondria is the powerhouse of the cell.";
    expect(defluff(input)).toBe(input);
  });

  it("handles empty string", () => {
    expect(defluff("")).toBe("");
  });

  it("strips 'Of course!' opener", () => {
    expect(defluff("Of course! Here is a breakdown of the topic.")).toBe(
      "Here is a breakdown of the topic.",
    );
  });
});

describe("defluff — closers", () => {
  it("strips a typical closer when enabled", () => {
    expect(
      defluff("The answer is 42. Let me know if you have any questions!", {
        closers: true,
      }),
    ).toBe("The answer is 42.");
  });

  it("strips 'I hope that helps' closer", () => {
    expect(
      defluff("Paris is the capital. I hope that helps!", { closers: true }),
    ).toBe("Paris is the capital.");
  });

  it("does not strip closers by default", () => {
    const input = "The answer is 42. Let me know if you need anything!";
    expect(defluff(input)).toBe(input);
  });

  it("strips both openers and closers together", () => {
    expect(
      defluff(
        "Great question! The answer is 42. Feel free to ask if you need more help!",
        { openers: true, closers: true },
      ),
    ).toBe("The answer is 42.");
  });
});

describe("defluff — threshold", () => {
  it("keeps borderline filler at high threshold", () => {
    // "Certainly," alone might not score high enough at 1.0
    const input = "Certainly, the answer is 42.";
    expect(defluff(input, { threshold: 1.0 })).toBe(input);
  });

  it("strips more aggressively at low threshold", () => {
    const result = defluff("Sure! The answer is 42.", { threshold: 0.3 });
    expect(result).toBe("The answer is 42.");
  });
});
