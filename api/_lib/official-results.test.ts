import { describe, expect, it } from "vitest";
import { parseOfficialSchedule } from "./official-results.js";

function gameCard(id: number, teamA: string, teamB: string, scoreA?: number, scoreB?: number): string {
  const score = (value?: number) => value === undefined ? "" : `<div class="ws-card__score">${value}</div>`;
  const finalClass = scoreA !== undefined && scoreB !== undefined ? " ws-card__link-list--team-1-wins" : "";
  return `
    <div class="ws-card">
      <span class="ws-card__meta">Game ${id} - LLB World Series</span>
      <ul class="ws-card__matchup${finalClass}">
        <li><h4 class="ws-card__team">${teamA}</h4>${score(scoreA)}</li>
        <li><h4 class="ws-card__team">${teamB}</h4>${score(scoreB)}</li>
      </ul>
    </div>`;
}

describe("official schedule parser", () => {
  it("extracts and normalizes final scores from all 38 official game cards", () => {
    const cards = Array.from({ length: 38 }, (_, index) => {
      const id = index + 1;
      return id === 1
        ? gameCard(id, "Latin America Region", "Caribbean Region", 2, 1)
        : gameCard(id, "TBA", "TBA");
    }).join("");

    const payload = parseOfficialSchedule(cards, "2026-08-20T12:00:00.000Z");

    expect(payload.games).toHaveLength(38);
    expect(payload.games[0]).toEqual({
      id: 1,
      status: "final",
      teams: [
        { teamId: "latin-america", name: "Latin America Region", score: 2 },
        { teamId: "caribbean", name: "Caribbean Region", score: 1 },
      ],
    });
    expect(payload.games[1].status).toBe("scheduled");
  });

  it("rejects incomplete page structures instead of publishing partial data", () => {
    expect(() => parseOfficialSchedule(gameCard(1, "Latin America Region", "Caribbean Region", 2, 1))).toThrow(
      "expected Games 1-38",
    );
  });
});
