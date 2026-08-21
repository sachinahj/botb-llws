import { fetchOfficialResults, storeResults } from "./_lib/official-results";

export function isTournamentWindow(now: Date): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  const year = value("year");
  const month = value("month");
  const day = value("day");
  return year === 2026 && month === 8 && day >= 19 && day <= 30;
}

export async function GET(request: Request): Promise<Response> {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  if (!isTournamentWindow(now)) {
    return Response.json({ skipped: true, reason: "Outside the 2026 tournament window." });
  }

  try {
    const payload = await fetchOfficialResults();
    await storeResults(payload);
    return Response.json({ success: true, fetchedAt: payload.fetchedAt, finalGames: payload.games.filter((game) => game.status === "final").length });
  } catch (error) {
    console.error("Scheduled LLWS result refresh failed", error);
    return Response.json({ error: "Scheduled result refresh failed." }, { status: 500 });
  }
}
