import { ArrowDown, Trophy } from "lucide-react";
import type { EntrantRef, ResolvedGame, Team, TournamentSnapshot } from "../types";

type Props = {
  game: ResolvedGame;
  snapshot: TournamentSnapshot;
};

function entrantLabel(ref: EntrantRef, resolvedTeam?: Team): string {
  if (resolvedTeam) return `${resolvedTeam.region} / ${resolvedTeam.manager}`;
  if (ref.kind === "team") return "Team TBD";
  return `${ref.kind === "winner" ? "Winner" : "Loser"} of Game ${ref.gameId}`;
}

function TeamRow({
  team,
  ref,
  score,
  isWinner,
  isEliminated,
}: {
  team?: Team;
  ref: EntrantRef;
  score?: number;
  isWinner: boolean;
  isEliminated: boolean;
}) {
  return (
    <div className={`team-row ${isWinner ? "team-row--winner" : ""} ${isEliminated ? "team-row--eliminated" : ""}`}>
      <span className={`manager-dot manager-${team?.manager.toLowerCase().replace(/[^a-z]+/g, "-") ?? "tbd"}`} />
      <span className="team-name">{entrantLabel(ref, team)}</span>
      {isWinner && <Trophy aria-label="Winner" size={14} strokeWidth={2.5} />}
      <strong className="team-score">{score ?? "-"}</strong>
    </div>
  );
}

export function GameCard({ game, snapshot }: Props) {
  const date = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(game.dateTime));
  const recordA = game.resolvedTeamA ? snapshot.records[game.resolvedTeamA.id] : undefined;
  const recordB = game.resolvedTeamB ? snapshot.records[game.resolvedTeamB.id] : undefined;

  return (
    <article className={`game-card game-card--${game.bracket}`}>
      <header className="game-card__header">
        <span>Game {game.id}</span>
        <span>{game.status === "final" ? "Final" : `${date} ET`}</span>
      </header>
      <TeamRow
        team={game.resolvedTeamA}
        ref={game.teamA}
        score={game.scoreA}
        isWinner={Boolean(game.winnerId && game.winnerId === game.resolvedTeamA?.id)}
        isEliminated={Boolean(recordA?.eliminated)}
      />
      <TeamRow
        team={game.resolvedTeamB}
        ref={game.teamB}
        score={game.scoreB}
        isWinner={Boolean(game.winnerId && game.winnerId === game.resolvedTeamB?.id)}
        isEliminated={Boolean(recordB?.eliminated)}
      />
      <footer className="game-card__footer">
        <span>{game.venue}</span>
        <span className="advance-path">
          {game.winnerAdvancesTo ? <>W <ArrowDown size={12} /> G{game.winnerAdvancesTo}</> : "Placement final"}
          {game.loserAdvancesTo ? <> · L <ArrowDown size={12} /> G{game.loserAdvancesTo}</> : null}
        </span>
      </footer>
    </article>
  );
}
