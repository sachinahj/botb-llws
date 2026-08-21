import { fetchOfficialResults, readStoredResults } from "./_lib/official-results.js";

export async function GET(): Promise<Response> {
  try {
    const stored = await readStoredResults();
    const payload = stored ?? await fetchOfficialResults();
    return Response.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Unable to load official LLWS results", error);
    return Response.json({ error: "Official results are temporarily unavailable." }, { status: 503 });
  }
}
