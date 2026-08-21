import { games } from "../data/games";
import { lastUpdated } from "../data/settings";
import { teams } from "../data/managers";
import type { Game, OfficialResultsPayload } from "../types";
import { resolveTournament } from "./bracket";

const RESULTS_ENDPOINT = "/api/results";

export function mergeOfficialResults(localGames: Game[], payload: OfficialResultsPayload): Game[] {
  let merged = localGames.map((game) => ({ ...game }));

  for (const result of [...payload.games].sort((a, b) => a.id - b.id)) {
    if (result.status !== "final" || result.teams.length !== 2) continue;
    const resolved = resolveTournament(merged, teams).games.find((game) => game.id === result.id);
    if (!resolved?.resolvedTeamA || !resolved.resolvedTeamB) continue;

    const teamAResult = result.teams.find((team) => team.teamId === resolved.resolvedTeamA?.id);
    const teamBResult = result.teams.find((team) => team.teamId === resolved.resolvedTeamB?.id);
    if (teamAResult?.score === undefined || teamBResult?.score === undefined || teamAResult.score === teamBResult.score) continue;

    merged = merged.map((game) => game.id === result.id
      ? { ...game, scoreA: teamAResult.score, scoreB: teamBResult.score, status: "final" }
      : game);
  }

  return merged;
}

async function fetchOfficialResults(): Promise<OfficialResultsPayload> {
  const response = await fetch(`${RESULTS_ENDPOINT}?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Official results request failed with ${response.status}.`);
  const payload = await response.json() as OfficialResultsPayload;
  if (!Array.isArray(payload.games)) throw new Error("Official results response is invalid.");
  return payload;
}

export async function getTournamentData() {
  let currentGames = games;
  let source = "local-fallback";
  let updatedAt = lastUpdated;

  try {
    const official = await fetchOfficialResults();
    currentGames = mergeOfficialResults(games, official);
    source = "little-league";
    updatedAt = official.fetchedAt;
  } catch {
    // Local Vite development and temporary upstream failures use bundled results.
  }

  return {
    source,
    sourceUrl: "https://www.littleleague.org/world-series/2026/llbws/",
    bracketUrl: "https://www.littleleague.org/wp-content/uploads/2026-LLBWS-Bracket-Teams.pdf",
    lastUpdated: updatedAt,
    snapshot: resolveTournament(currentGames, teams),
  };
}

export async function refreshOfficialResults() {
  const official = await fetchOfficialResults();
  return {
    source: "little-league",
    lastUpdated: official.fetchedAt,
    snapshot: resolveTournament(mergeOfficialResults(games, official), teams),
  };
}
