import { describe, it, expect } from "vitest";
import { scoreOpener, scoreCloser } from "../src/heuristics.js";

describe("scoreOpener", () => {
  it("scores classic filler high", () => {
    expect(scoreOpener("Great question!")).toBeGreaterThanOrEqual(0.8);
    expect(scoreOpener("Sure thing!")).toBeGreaterThanOrEqual(0.8);
    expect(scoreOpener("Absolutely!")).toBeGreaterThanOrEqual(0.8);
    expect(scoreOpener("I'd be happy to help you with that!")).toBeGreaterThanOrEqual(0.8);
  });

  it("scores factual content low", () => {
    expect(scoreOpener("The French Revolution began in 1789.")).toBeLessThan(0.5);
    expect(scoreOpener("JavaScript was created by Brendan Eich.")).toBeLessThan(0.5);
    expect(scoreOpener("There are 195 countries in the world.")).toBeLessThan(0.5);
  });

  it("scores empty string as 0", () => {
    expect(scoreOpener("")).toBe(0);
  });
});

describe("scoreCloser", () => {
  it("scores classic closers high", () => {
    expect(scoreCloser("Let me know if you have any questions!")).toBeGreaterThanOrEqual(0.8);
    expect(scoreCloser("I hope that helps!")).toBeGreaterThanOrEqual(0.8);
    expect(scoreCloser("Feel free to ask if you need anything!")).toBeGreaterThanOrEqual(0.8);
  });

  it("scores factual content low", () => {
    expect(scoreCloser("The result is 42.")).toBeLessThan(0.5);
    expect(scoreCloser("This was confirmed in the 2023 report.")).toBeLessThan(0.5);
  });
});
