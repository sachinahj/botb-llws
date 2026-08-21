import { load } from "cheerio";
import { get, put } from "@vercel/blob";
import { teams } from "../../src/data/managers.js";
import type { OfficialGameResult, OfficialResultsPayload } from "../../src/types.js";

export const OFFICIAL_SCHEDULE_URL = "https://www.littleleague.org/world-series/2026/llbws/tournaments/world-series/";
const BLOB_PATH = "llws/2026-results.json";

function hasBlobCredentials(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN
    || (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID),
  );
}

function normalizeTeamName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\bregion\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const teamAliases = new Map<string, string>();
for (const team of teams) {
  teamAliases.set(normalizeTeamName(team.region), team.id);
}
teamAliases.set("europe and africa", "europe-africa");

export function parseOfficialSchedule(html: string, fetchedAt = new Date().toISOString()): OfficialResultsPayload {
  const $ = load(html);
  const results: OfficialGameResult[] = [];

  $(".ws-card").each((_, card) => {
    const meta = $(card).find(".ws-card__meta").text().replace(/\s+/g, " ").trim();
    const gameMatch = meta.match(/\bGame\s+(\d+)\b/i);
    if (!gameMatch) return;

    const matchup = $(card).find(".ws-card__matchup");
    const gameTeams = matchup.children("li").toArray().map((teamRow) => {
      const name = $(teamRow).find(".ws-card__team").text().replace(/\s+/g, " ").trim();
      const scoreText = $(teamRow).find(".ws-card__score").text().trim();
      const score = /^\d+$/.test(scoreText) ? Number(scoreText) : undefined;
      return { teamId: teamAliases.get(normalizeTeamName(name)), name, score };
    });

    if (gameTeams.length !== 2) return;
    const hasOfficialWinner = /ws-card__link-list--team-[12]-wins/.test(matchup.attr("class") ?? "");
    const isFinal = hasOfficialWinner && gameTeams.every((team) => team.score !== undefined) && gameTeams[0].score !== gameTeams[1].score;
    results.push({ id: Number(gameMatch[1]), status: isFinal ? "final" : "scheduled", teams: gameTeams });
  });

  const uniqueIds = new Set(results.map((game) => game.id));
  if (uniqueIds.size !== 38 || ![...uniqueIds].every((id) => id >= 1 && id <= 38)) {
    throw new Error(`Official schedule validation failed: expected Games 1-38, found ${uniqueIds.size}.`);
  }
  if (results.some((game) => game.status === "final" && game.teams.some((team) => !team.teamId))) {
    throw new Error("Official schedule validation failed: a final game contains an unknown team name.");
  }

  return {
    source: "little-league",
    sourceUrl: OFFICIAL_SCHEDULE_URL,
    fetchedAt,
    games: results.sort((a, b) => a.id - b.id),
  };
}

export async function fetchOfficialResults(): Promise<OfficialResultsPayload> {
  const response = await fetch(OFFICIAL_SCHEDULE_URL, {
    headers: { "user-agent": "BOTB-LLWS/1.0 (+https://github.com/sachinahj/botb-llws)" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Little League returned ${response.status}.`);
  return parseOfficialSchedule(await response.text());
}

export async function readStoredResults(): Promise<OfficialResultsPayload | null> {
  if (!hasBlobCredentials()) return null;
  const stored = await get(BLOB_PATH, { access: "private", useCache: false });
  if (!stored || stored.statusCode !== 200) return null;
  return new Response(stored.stream).json() as Promise<OfficialResultsPayload>;
}

export async function storeResults(payload: OfficialResultsPayload): Promise<void> {
  if (!hasBlobCredentials()) {
    throw new Error("No Vercel Blob store is connected to this project.");
  }
  await put(BLOB_PATH, JSON.stringify(payload), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
}
