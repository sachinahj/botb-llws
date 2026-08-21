import { describe, expect, it } from "vitest";
import { games } from "../data/games";
import type { TeamRecord } from "../types";
import { rankSideTeams, resolveTournament, runDifferentialPerGame, runsAllowedPerGame } from "./bracket";

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

  it("uses advancement tier before winning percentage", () => {
    const snapshot = resolveTournament();
    const northwest = snapshot.teams.find((team) => team.id === "northwest")!;
    const southeast = snapshot.teams.find((team) => team.id === "southeast")!;
    const records: Record<string, TeamRecord> = {
      northwest: { ...snapshot.records.northwest, wins: 0, losses: 2 },
      southeast: { ...snapshot.records.southeast, wins: 2, losses: 2 },
    };

    const ranked = rankSideTeams(
      [northwest, southeast],
      records,
      undefined,
      undefined,
      new Map([[northwest.id, 5], [southeast.id, 7]]),
      new Map(),
    );

    expect(ranked.map((team) => team.id)).toEqual(["northwest", "southeast"]);
  });

  it("uses normalized performance within the same placement tier", () => {
    const snapshot = resolveTournament();
    const northwest = snapshot.teams.find((team) => team.id === "northwest")!;
    const southeast = snapshot.teams.find((team) => team.id === "southeast")!;
    const records: Record<string, TeamRecord> = {
      northwest: { ...snapshot.records.northwest, wins: 1, losses: 1, runsFor: 8, runsAgainst: 6 },
      southeast: { ...snapshot.records.southeast, wins: 2, losses: 2, runsFor: 18, runsAgainst: 12 },
    };

    const ranked = rankSideTeams(
      [northwest, southeast],
      records,
      undefined,
      undefined,
      new Map([[northwest.id, 5], [southeast.id, 5]]),
      new Map(),
    );

    expect(ranked.map((team) => team.id)).toEqual(["southeast", "northwest"]);
    expect(runDifferentialPerGame(records.southeast)).toBe(1.5);
    expect(runsAllowedPerGame(records.southeast)).toBe(3);
  });
});
