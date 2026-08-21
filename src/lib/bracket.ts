import { games as baseGames, roundStages } from "../data/games";
import { teams as baseTeams } from "../data/managers";
import type { EntrantRef, Game, ResolvedGame, Side, Team, TeamRecord, TournamentSnapshot } from "../types";

export function getWinnerId(game: ResolvedGame): string | undefined {
  if (game.status !== "final" || game.scoreA === undefined || game.scoreB === undefined) return undefined;
  if (game.scoreA === game.scoreB) return undefined;
  return game.scoreA > game.scoreB ? game.resolvedTeamA?.id : game.resolvedTeamB?.id;
}

export function getLoserId(game: ResolvedGame): string | undefined {
  if (game.status !== "final" || game.scoreA === undefined || game.scoreB === undefined) return undefined;
  if (game.scoreA === game.scoreB) return undefined;
  return game.scoreA < game.scoreB ? game.resolvedTeamA?.id : game.resolvedTeamB?.id;
}

export function resolveTournament(games: Game[] = baseGames, teams: Team[] = baseTeams): TournamentSnapshot {
  const teamById = new Map(teams.map((team) => [team.id, team]));
  const byId = new Map<number, ResolvedGame>();

  const resolveEntrant = (entrant: EntrantRef): Team | undefined => {
    if (entrant.kind === "team") return teamById.get(entrant.teamId);
    const source = byId.get(entrant.gameId);
    if (!source) return undefined;
    const id = entrant.kind === "winner" ? source.winnerId : source.loserId;
    return id ? teamById.get(id) : undefined;
  };

  const resolvedGames = [...games]
    .sort((a, b) => a.id - b.id)
    .map((game) => {
      const resolved: ResolvedGame = {
        ...game,
        resolvedTeamA: resolveEntrant(game.teamA),
        resolvedTeamB: resolveEntrant(game.teamB),
      };
      resolved.winnerId = getWinnerId(resolved);
      resolved.loserId = getLoserId(resolved);
      byId.set(resolved.id, resolved);
      return resolved;
    });

  return {
    games: resolvedGames,
    teams,
    records: buildRecords(resolvedGames, teams),
  };
}

function buildRecords(games: ResolvedGame[], teams: Team[]): Record<string, TeamRecord> {
  const records: Record<string, TeamRecord> = Object.fromEntries(
    teams.map((team) => [
      team.id,
      {
        wins: 0,
        losses: 0,
        runsFor: 0,
        runsAgainst: 0,
        eliminated: false,
        worldChampion: false,
        finish: 10,
        projectedFinish: 10,
        statusLabel: "Alive",
      } satisfies TeamRecord,
    ]),
  );

  const sideEliminationGame = new Map<string, number>();
  const sidePlacementTier = new Map<string, number>();
  const currentStage = new Map<string, number>();
  const sideChampion = new Map<Side, string>();
  const sideRunnerUp = new Map<Side, string>();

  for (const game of games) {
    if (game.side !== "us" && game.side !== "international") continue;
    const stage = roundStages[game.round] ?? 0;
    for (const team of [game.resolvedTeamA, game.resolvedTeamB]) {
      if (team) currentStage.set(team.id, Math.max(currentStage.get(team.id) ?? 0, stage));
    }
  }

  for (const game of games) {
    if (game.status !== "final" || !game.winnerId || !game.loserId) continue;
    const teamA = game.resolvedTeamA;
    const teamB = game.resolvedTeamB;
    if (!teamA || !teamB || game.scoreA === undefined || game.scoreB === undefined) continue;

    records[teamA.id].runsFor += game.scoreA;
    records[teamA.id].runsAgainst += game.scoreB;
    records[teamB.id].runsFor += game.scoreB;
    records[teamB.id].runsAgainst += game.scoreA;
    records[game.winnerId].wins += 1;
    records[game.loserId].losses += 1;

    if ((game.side === "us" || game.side === "international") && game.bracket === "championship") {
      sideChampion.set(game.side, game.winnerId);
      sideRunnerUp.set(game.side, game.loserId);
    }

    if ((game.side === "us" || game.side === "international") && game.loserPlacementTier !== undefined) {
      sideEliminationGame.set(game.loserId, game.id);
      sidePlacementTier.set(game.loserId, game.loserPlacementTier);
    }

    if (game.id === 38) {
      records[game.winnerId].worldChampion = true;
    }
  }

  for (const side of ["us", "international"] as const) {
    const sideTeams = teams.filter((team) => team.side === side);
    const ranked = rankSideTeams(
      sideTeams,
      records,
      sideChampion.get(side),
      sideRunnerUp.get(side),
      sidePlacementTier,
      currentStage,
    );
    ranked.forEach((team, index) => {
      const record = records[team.id];
      record.projectedFinish = index + 1;
      record.finish = index + 1;
      record.eliminated = Boolean(sideEliminationGame.has(team.id) || sideRunnerUp.get(side) === team.id);
      if (sideChampion.get(side) === team.id) record.statusLabel = `${sideName(side)} Champion`;
      else if (sideRunnerUp.get(side) === team.id) record.statusLabel = `${sideName(side)} Runner-up`;
      else if (record.eliminated) record.statusLabel = `Eliminated in Game ${sideEliminationGame.get(team.id)}`;
      else record.statusLabel = `${record.wins}-${record.losses}, alive`;
    });
  }

  return records;
}

export function rankSideTeams(
  teams: Team[],
  records: Record<string, TeamRecord>,
  championId: string | undefined,
  runnerUpId: string | undefined,
  placementTier: Map<string, number>,
  currentStage: Map<string, number>,
): Team[] {
  return [...teams].sort((a, b) => {
    if (a.id === championId) return -1;
    if (b.id === championId) return 1;
    if (a.id === runnerUpId) return -1;
    if (b.id === runnerUpId) return 1;

    const aEliminated = placementTier.has(a.id);
    const bEliminated = placementTier.has(b.id);
    if (aEliminated !== bEliminated) return aEliminated ? 1 : -1;
    if (aEliminated && bEliminated) {
      const tier = (placementTier.get(a.id) ?? 10) - (placementTier.get(b.id) ?? 10);
      if (tier !== 0) return tier;
    } else {
      const stage = (currentStage.get(b.id) ?? 0) - (currentStage.get(a.id) ?? 0);
      if (stage !== 0) return stage;

      const lossDiff = records[a.id].losses - records[b.id].losses;
      if (lossDiff !== 0) return lossDiff;
    }

    const ar = records[a.id];
    const br = records[b.id];
    const winPercentage = winningPercentage(br) - winningPercentage(ar);
    if (winPercentage !== 0) return winPercentage;
    const runDiff = runDifferentialPerGame(br) - runDifferentialPerGame(ar);
    if (runDiff !== 0) return runDiff;
    const runsAllowed = runsAllowedPerGame(ar) - runsAllowedPerGame(br);
    if (runsAllowed !== 0) return runsAllowed;
    return a.region.localeCompare(b.region);
  });
}

export function runDifferential(record: TeamRecord): number {
  return record.runsFor - record.runsAgainst;
}

export function winningPercentage(record: TeamRecord): number {
  const played = gamesPlayed(record);
  return played === 0 ? 0 : record.wins / played;
}

export function gamesPlayed(record: TeamRecord): number {
  return record.wins + record.losses;
}

export function runDifferentialPerGame(record: TeamRecord): number {
  const played = gamesPlayed(record);
  return played === 0 ? 0 : runDifferential(record) / played;
}

export function runsAllowedPerGame(record: TeamRecord): number {
  const played = gamesPlayed(record);
  return played === 0 ? 0 : record.runsAgainst / played;
}

export function sideName(side: Exclude<Side, "world">): string {
  return side === "us" ? "U.S." : "International";
}
