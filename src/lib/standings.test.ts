import { describe, expect, it } from "vitest";
import { resolveTournament } from "./bracket";
import { calculateStandings, compareStandings, type ManagerStanding } from "./standings";

describe("fantasy standings", () => {
  it("combines each manager's U.S. and International finish", () => {
    const snapshot = resolveTournament();
    const ashish = calculateStandings(snapshot).find((row) => row.manager === "Ashish")!;

    expect(ashish.rawScore).toBe(
      snapshot.records.northwest.projectedFinish + snapshot.records.australia.projectedFinish,
    );
  });

  it("applies the configurable championship bonus", () => {
    const snapshot = resolveTournament();
    snapshot.records.northwest.worldChampion = true;
    const withBonus = calculateStandings(snapshot, { championshipBonus: true }).find((row) => row.manager === "Ashish")!;
    const withoutBonus = calculateStandings(snapshot, { championshipBonus: false }).find((row) => row.manager === "Ashish")!;

    expect(withBonus.combinedScore).toBe(withoutBonus.combinedScore - 1);
  });

  it("orders every manager-level tiebreaker in sequence", () => {
    const base: ManagerStanding = {
      rank: 0,
      manager: "A",
      usTeamId: "a-us",
      internationalTeamId: "a-intl",
      usFinish: 3,
      internationalFinish: 3,
      rawScore: 6,
      combinedScore: 6,
      ownsWorldChampion: false,
      bestSingleFinish: 3,
      combinedWinningPercentage: 0.5,
      combinedRunDifferential: 0,
      coinFlip: 2,
    };

    expect(compareStandings({ ...base, ownsWorldChampion: true }, base)).toBeLessThan(0);
    expect(compareStandings({ ...base, bestSingleFinish: 2 }, base)).toBeLessThan(0);
    expect(compareStandings({ ...base, combinedWinningPercentage: 0.75 }, base)).toBeLessThan(0);
    expect(compareStandings({ ...base, combinedRunDifferential: 4 }, base)).toBeLessThan(0);
    expect(compareStandings({ ...base, coinFlip: 1 }, base)).toBeLessThan(0);
  });
});
