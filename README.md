# BOTB LLWS Draft Order

A mobile-friendly 2026 Little League World Series bracket and fantasy draft-order tracker.

## Local development

```bash
npm install
npm run dev
```

The tournament is defined with explicit winner and loser references in `src/data/games.ts`. Results are resolved in `src/lib/bracket.ts`, while fantasy scoring and tiebreakers live in `src/lib/standings.ts`.

## Checks

```bash
npm test
npm run build
```

The app reads official results through `/api/results`. A protected Vercel Cron Job scrapes the official schedule once nightly at approximately 10:00 PM Eastern during August 19-30, validates all 38 game cards, and stores the snapshot in a private Vercel Blob. The bundled results remain the fallback if the official page or storage is unavailable.

## Vercel setup

1. Import the GitHub repository into Vercel using the Vite preset.
2. In the project's Storage tab, create and connect a private Blob store. Vercel adds `BLOB_READ_WRITE_TOKEN` automatically.
3. In Settings > Environment Variables, add `CRON_SECRET` with a random value of at least 16 characters for Production.
4. Deploy. The cron declaration in `vercel.json` is registered on the production deployment.

The cron endpoint refuses unauthenticated requests, skips dates outside the 2026 tournament, and never changes bracket routing. It only stores official team/score data; `src/lib/bracket.ts` remains responsible for advancement.
