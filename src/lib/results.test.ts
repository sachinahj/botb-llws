import { describe, expect, it } from "vitest";
import { games } from "../data/games";
import type { OfficialResultsPayload } from "../types";
import { mergeOfficialResults } from "./results";

describe("official result merge", () => {
  it("aligns scores by team identity when the official page reverses card order", () => {
    const payload: OfficialResultsPayload = {
      source: "little-league",
      sourceUrl: "https://www.littleleague.org/",
      fetchedAt: "2026-08-21T20:00:00.000Z",
      games: [{
        id: 9,
        status: "final",
        teams: [
          { teamId: "latin-america", name: "Latin America Region", score: 3 },
          { teamId: "panama", name: "Panama Region", score: 2 },
        ],
      }],
    };

    const game9 = mergeOfficialResults(games, payload).find((game) => game.id === 9)!;

    expect(game9.teamA).toEqual({ kind: "team", teamId: "panama" });
    expect(game9.scoreA).toBe(2);
    expect(game9.scoreB).toBe(3);
    expect(game9.status).toBe("final");
  });

  it("ignores results whose participants cannot be validated from prior games", () => {
    const payload: OfficialResultsPayload = {
      source: "little-league",
      sourceUrl: "https://www.littleleague.org/",
      fetchedAt: "2026-08-21T20:00:00.000Z",
      games: [{
        id: 18,
        status: "final",
        teams: [
          { teamId: "australia", name: "Australia Region", score: 4 },
          { teamId: "panama", name: "Panama Region", score: 3 },
        ],
      }],
    };

    const game18 = mergeOfficialResults(games, payload).find((game) => game.id === 18)!;
    expect(game18.status).toBe("scheduled");
  });
});
