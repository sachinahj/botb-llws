import { games as baseGames } from "../data/games";
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
  const sideChampion = new Map<Side, string>();
  const sideRunnerUp = new Map<Side, string>();

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
    } else if ((game.side === "us" || game.side === "international") && records[game.loserId].losses >= 2) {
      sideEliminationGame.set(game.loserId, game.id);
    }

    if (game.id === 38) {
      records[game.winnerId].worldChampion = true;
    }
  }

  for (const side of ["us", "international"] as const) {
    const sideTeams = teams.filter((team) => team.side === side);
    const ranked = rankSideTeams(sideTeams, records, sideChampion.get(side), sideRunnerUp.get(side), sideEliminationGame);
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

function rankSideTeams(
  teams: Team[],
  records: Record<string, TeamRecord>,
  championId: string | undefined,
  runnerUpId: string | undefined,
  eliminationGame: Map<string, number>,
): Team[] {
  return [...teams].sort((a, b) => {
    if (a.id === championId) return -1;
    if (b.id === championId) return 1;
    if (a.id === runnerUpId) return -1;
    if (b.id === runnerUpId) return 1;

    const aEliminated = eliminationGame.has(a.id);
    const bEliminated = eliminationGame.has(b.id);
    if (aEliminated !== bEliminated) return aEliminated ? 1 : -1;
    if (aEliminated && bEliminated) {
      const eliminatedLater = (eliminationGame.get(b.id) ?? 0) - (eliminationGame.get(a.id) ?? 0);
      if (eliminatedLater !== 0) return eliminatedLater;
    }

    const ar = records[a.id];
    const br = records[b.id];
    const lossDiff = ar.losses - br.losses;
    if (lossDiff !== 0) return lossDiff;
    const winDiff = br.wins - ar.wins;
    if (winDiff !== 0) return winDiff;
    const runDiff = runDifferential(br) - runDifferential(ar);
    if (runDiff !== 0) return runDiff;
    return a.region.localeCompare(b.region);
  });
}

export function runDifferential(record: TeamRecord): number {
  return record.runsFor - record.runsAgainst;
}

export function winningPercentage(record: TeamRecord): number {
  const games = record.wins + record.losses;
  return games === 0 ? 0 : record.wins / games;
}

export function sideName(side: Exclude<Side, "world">): string {
  return side === "us" ? "U.S." : "International";
}
