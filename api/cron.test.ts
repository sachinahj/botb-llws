import { describe, expect, it } from "vitest";
import { isTournamentWindow } from "./cron.js";

describe("scheduled result window", () => {
  it("accepts the nightly run using the Eastern tournament date", () => {
    expect(isTournamentWindow(new Date("2026-08-20T02:00:00Z"))).toBe(true);
    expect(isTournamentWindow(new Date("2026-08-31T02:00:00Z"))).toBe(true);
  });

  it("rejects dates outside the tournament", () => {
    expect(isTournamentWindow(new Date("2026-08-19T02:00:00Z"))).toBe(false);
    expect(isTournamentWindow(new Date("2026-09-01T02:00:00Z"))).toBe(false);
  });
});
