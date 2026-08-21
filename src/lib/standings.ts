import { managers, teams } from "../data/managers";
import type { StandingsOptions, TournamentSnapshot } from "../types";
import { runDifferential, winningPercentage } from "./bracket";

export type ManagerStanding = {
  rank: number;
  manager: string;
  usTeamId: string;
  internationalTeamId: string;
  usFinish: number;
  internationalFinish: number;
  rawScore: number;
  combinedScore: number;
  ownsWorldChampion: boolean;
  bestSingleFinish: number;
  combinedWinningPercentage: number;
  combinedRunDifferential: number;
  coinFlip: number;
};

function stableCoinFlip(manager: string): number {
  return [...manager].reduce((value, character) => ((value * 31) + character.charCodeAt(0)) >>> 0, 2166136261);
}

export function compareStandings(a: ManagerStanding, b: ManagerStanding): number {
  const score = a.combinedScore - b.combinedScore;
  if (score !== 0) return score;
  if (a.ownsWorldChampion !== b.ownsWorldChampion) return a.ownsWorldChampion ? -1 : 1;
  const best = a.bestSingleFinish - b.bestSingleFinish;
  if (best !== 0) return best;
  const wp = b.combinedWinningPercentage - a.combinedWinningPercentage;
  if (wp !== 0) return wp;
  const rd = b.combinedRunDifferential - a.combinedRunDifferential;
  if (rd !== 0) return rd;
  return a.coinFlip - b.coinFlip;
}

export function calculateStandings(
  snapshot: TournamentSnapshot,
  options: StandingsOptions = { championshipBonus: true },
): ManagerStanding[] {
  const rows = managers.map((manager) => {
    const managerTeams = teams.filter((team) => team.manager === manager);
    const usTeam = managerTeams.find((team) => team.side === "us");
    const internationalTeam = managerTeams.find((team) => team.side === "international");
    if (!usTeam || !internationalTeam) {
      throw new Error(`Manager ${manager} must have exactly one U.S. and one International team.`);
    }
    const usRecord = snapshot.records[usTeam.id];
    const intlRecord = snapshot.records[internationalTeam.id];
    const rawScore = usRecord.projectedFinish + intlRecord.projectedFinish;
    const ownsWorldChampion = usRecord.worldChampion || intlRecord.worldChampion;

    return {
      rank: 0,
      manager,
      usTeamId: usTeam.id,
      internationalTeamId: internationalTeam.id,
      usFinish: usRecord.projectedFinish,
      internationalFinish: intlRecord.projectedFinish,
      rawScore,
      combinedScore: rawScore - (options.championshipBonus && ownsWorldChampion ? 1 : 0),
      ownsWorldChampion,
      bestSingleFinish: Math.min(usRecord.projectedFinish, intlRecord.projectedFinish),
      combinedWinningPercentage: (winningPercentage(usRecord) + winningPercentage(intlRecord)) / 2,
      combinedRunDifferential: runDifferential(usRecord) + runDifferential(intlRecord),
      coinFlip: stableCoinFlip(manager),
    };
  });

  return rows
    .sort(compareStandings)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}
