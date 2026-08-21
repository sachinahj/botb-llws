import { describe, expect, it } from "vitest";
import { games } from "../data/games";
import { resolveTournament } from "./bracket";

describe("tournament routing", () => {
  it("groups the opening and second winners rounds correctly on each side", () => {
    const snapshot = resolveTournament();
    const roundIds = (side: "us" | "international", round: string) => snapshot.games
      .filter((game) => game.side === side && game.round === round)
      .map((game) => game.id);

    expect(roundIds("international", "Opening Round")).toEqual([1, 3]);
    expect(roundIds("international", "Winners Round 2")).toEqual([5, 7, 9, 11]);
    expect(roundIds("us", "Opening Round")).toEqual([2, 4]);
    expect(roundIds("us", "Winners Round 2")).toEqual([6, 8, 10, 12]);
  });

  it("advances winners through explicit game references", () => {
    const snapshot = resolveTournament();
    const game10 = snapshot.games.find((game) => game.id === 10)!;

    expect(game10.resolvedTeamB?.id).toBe("northwest");
  });

  it("routes losers into the specified elimination game", () => {
    const snapshot = resolveTournament();
    const game16 = snapshot.games.find((game) => game.id === 16)!;

    expect(game16.resolvedTeamA?.id).toBe("southeast");
  });

  it("eliminates a team after its second loss", () => {
    const completed = games.map((game) => {
      if (game.id === 8) return { ...game, scoreA: 4, scoreB: 2, status: "final" as const };
      if (game.id === 16) return { ...game, scoreA: 3, scoreB: 1, status: "final" as const };
      return game;
    });
    const snapshot = resolveTournament(completed);

    expect(snapshot.records.midwest.losses).toBe(2);
    expect(snapshot.records.midwest.eliminated).toBe(true);
    expect(snapshot.records.midwest.statusLabel).toBe("Eliminated in Game 16");
  });
});
