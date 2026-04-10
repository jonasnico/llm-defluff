import { describe, it, expect } from "vitest";
import { createStripper } from "../src/stripper.js";

describe("createStripper — streaming", () => {
  it("strips filler opener from chunked stream", () => {
    const stripper = createStripper();
    const chunks = ["Great ", "question! ", "The ", "answer ", "is 42."];
    const output: string[] = [];

    for (const chunk of chunks) {
      const result = stripper.push(chunk);
      if (result) output.push(result);
    }

    const remaining = stripper.flush();
    if (remaining) output.push(remaining);

    expect(output.join("")).toBe("The answer is 42.");
  });

  it("passes through non-filler content immediately after resolution", () => {
    const stripper = createStripper();

    // Feed a complete filler sentence
    stripper.push("Sure thing! ");

    // Feed the start of real content — should resolve and pass through
    const result = stripper.push("The answer is 42.");
    expect(result).toBe("The answer is 42.");

    // Subsequent chunks pass through directly
    expect(stripper.push(" More info here.")).toBe(" More info here.");
    expect(stripper.getState()).toBe("passthrough");
  });

  it("flushes non-filler content if stream ends during buffering", () => {
    const stripper = createStripper();
    stripper.push("The answer is");

    const result = stripper.flush();
    expect(result).toBe("The answer is");
  });

  it("handles stream that is entirely filler", () => {
    const stripper = createStripper();
    stripper.push("Great question!");

    const result = stripper.flush();
    // When the entire stream is filler, flush returns empty
    expect(result).toBe(null);
  });

  it("handles empty stream", () => {
    const stripper = createStripper();
    expect(stripper.flush()).toBe(null);
  });

  it("transitions through correct states", () => {
    const stripper = createStripper();
    expect(stripper.getState()).toBe("buffering");

    stripper.push("Sure! The answer is 42.");
    expect(stripper.getState()).toBe("passthrough");
  });
});
