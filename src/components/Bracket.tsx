import { useState } from "react";
import { bracketCanvas, bracketPositions } from "../data/bracketLayout";
import type { EntrantRef, ResolvedGame, Side, Team, TournamentSnapshot } from "../types";
import { GameCard } from "./GameCard";

type Props = { snapshot: TournamentSnapshot };
type BracketView = "all" | "winners" | "elimination" | "finals";

const roundOrder: Record<Exclude<Side, "world">, string[]> = {
  international: ["Opening Round", "Winners Round 2", "Winners Semifinal", "Winners Final", "Elimination Round 1", "Elimination Round 2", "Elimination Round 3", "Elimination Final", "International Semifinal", "International Championship"],
  us: ["Opening Round", "Winners Round 2", "Winners Semifinal", "Winners Final", "Elimination Round 1", "Elimination Round 2", "Elimination Round 3", "Elimination Final", "U.S. Semifinal", "U.S. Championship"],
};

function entrantLabel(ref: EntrantRef, team?: Team): string {
  if (team) return `${team.region} / ${team.manager}`;
  if (ref.kind === "team") return "Team TBD";
  return `${ref.kind === "winner" ? "W" : "L"}${ref.gameId} / TBD`;
}

function DiagramGame({ game, snapshot }: { game: ResolvedGame; snapshot: TournamentSnapshot }) {
  const position = bracketPositions[game.id];
  const rows = [
    { ref: game.teamA, team: game.resolvedTeamA, score: game.scoreA },
    { ref: game.teamB, team: game.resolvedTeamB, score: game.scoreB },
  ];
  return (
    <article className={`diagram-game diagram-game--${game.bracket}`} style={{ left: position.x, top: position.y }} aria-label={`Game ${game.id}, ${game.round}`}>
      <header>
        <b>Game {game.id}</b>
        <span>{game.status === "final" ? "Final" : new Intl.DateTimeFormat("en-US", { month: "numeric", day: "numeric" }).format(new Date(game.dateTime))}</span>
      </header>
      {rows.map((row, index) => {
        const winner = Boolean(game.winnerId && game.winnerId === row.team?.id);
        const eliminated = Boolean(row.team && snapshot.records[row.team.id]?.eliminated);
        return (
          <div className={`diagram-team ${winner ? "diagram-team--winner" : ""} ${eliminated ? "diagram-team--eliminated" : ""}`} key={index}>
            <span>{entrantLabel(row.ref, row.team)}</span>
            <strong>{row.score ?? "-"}</strong>
          </div>
        );
      })}
    </article>
  );
}

function connectorPath(source: ResolvedGame, target: ResolvedGame, kind: "winner" | "loser"): string {
  const from = bracketPositions[source.id];
  const to = bracketPositions[target.id];
  const movesRight = to.x + bracketCanvas.cardWidth / 2 >= from.x + bracketCanvas.cardWidth / 2;
  const startX = movesRight ? from.x + bracketCanvas.cardWidth : from.x;
  const endX = movesRight ? to.x : to.x + bracketCanvas.cardWidth;
  const startY = from.y + bracketCanvas.cardHeight / 2;
  const targetSlot = target.teamA.kind === kind && target.teamA.gameId === source.id ? 0 : 1;
  const endY = to.y + (targetSlot === 0 ? 42 : 68);
  const midX = startX + (endX - startX) / 2;
  return `M ${startX} ${startY} H ${midX} V ${endY} H ${endX}`;
}

function FullBracket({ snapshot }: Props) {
  const gameById = new Map(snapshot.games.map((game) => [game.id, game]));
  const paths = snapshot.games.flatMap((game) => {
    const links: Array<{ targetId: number; kind: "winner" | "loser" }> = [];
    if (game.winnerAdvancesTo) links.push({ targetId: game.winnerAdvancesTo, kind: "winner" });
    if (game.loserAdvancesTo) links.push({ targetId: game.loserAdvancesTo, kind: "loser" });
    return links
      .map((link) => ({ source: game, target: gameById.get(link.targetId), kind: link.kind }))
      .filter((link): link is { source: ResolvedGame; target: ResolvedGame; kind: "winner" | "loser" } => Boolean(link.target));
  });

  return (
    <div className="official-bracket-scroll" tabIndex={0} aria-label="Complete mirrored tournament bracket. Scroll horizontally to view all games.">
      <div className="official-bracket" style={{ width: bracketCanvas.width, height: bracketCanvas.height }}>
        <div className="diagram-side-title diagram-side-title--us">United States Bracket</div>
        <div className="diagram-side-title diagram-side-title--international">International Bracket</div>
        <div className="diagram-center-title">World Series</div>
        <svg className="bracket-connectors" width={bracketCanvas.width} height={bracketCanvas.height} aria-hidden="true">
          {paths.map(({ source, target, kind }) => <path key={`${source.id}-${kind}-${target.id}`} className={`connector connector--${kind}`} d={connectorPath(source, target, kind)} />)}
        </svg>
        {snapshot.games.map((game) => <DiagramGame key={game.id} game={game} snapshot={snapshot} />)}
      </div>
    </div>
  );
}

function BracketSide({ side, title, games, snapshot }: { side: Exclude<Side, "world">; title: string; games: ResolvedGame[]; snapshot: TournamentSnapshot }) {
  const columns = roundOrder[side].map((round) => ({ round, games: games.filter((game) => game.round === round) })).filter((column) => column.games.length > 0);
  return (
    <section className="bracket-section bracket-section--filtered">
      <div className="section-heading"><div><p className="eyebrow">Double elimination</p><h2>{title}</h2></div><p className="swipe-hint">Swipe to follow</p></div>
      <div className="bracket-scroll" tabIndex={0}>
        <div className="bracket-grid">
          {columns.map((column) => (
            <div className="round-column" key={column.round}>
              <h3>{column.round}</h3>
              <div className="round-games">{column.games.map((game) => <GameCard key={game.id} game={game} snapshot={snapshot} />)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FilteredBracket({ snapshot, view }: Props & { view: "winners" | "elimination" }) {
  const bracket = view === "winners" ? "winners" : "elimination";
  const label = view === "winners" ? "Winners" : "Elimination";
  return (
    <div className="page-stack">
      <BracketSide side="us" title={`U.S. ${label} Bracket`} games={snapshot.games.filter((game) => game.side === "us" && game.bracket === bracket)} snapshot={snapshot} />
      <BracketSide side="international" title={`International ${label} Bracket`} games={snapshot.games.filter((game) => game.side === "international" && game.bracket === bracket)} snapshot={snapshot} />
    </div>
  );
}

function Finals({ snapshot }: Props) {
  const games = snapshot.games.filter((game) => game.bracket === "championship" || game.bracket === "placement");
  return <section className="bracket-section finals-section"><div className="section-heading"><div><p className="eyebrow">Williamsport</p><h2>Championship Games</h2></div></div><div className="world-finals">{games.map((game) => <GameCard key={game.id} game={game} snapshot={snapshot} />)}</div></section>;
}

export function Bracket({ snapshot }: Props) {
  const [view, setView] = useState<BracketView>("all");
  const views: Array<{ id: BracketView; label: string }> = [
    { id: "all", label: "All Games" },
    { id: "winners", label: "Winners" },
    { id: "elimination", label: "Elimination" },
    { id: "finals", label: "Finals" },
  ];
  return (
    <section className="official-bracket-section">
      <div className="official-bracket-heading">
        <div><p className="eyebrow">2026 Little League Baseball World Series</p><h2>Tournament Bracket</h2></div>
        <div className="connector-legend"><span><i className="winner-line" /> Winner path</span><span><i className="loser-line" /> Loser path</span></div>
      </div>
      <div className="bracket-view-tabs" role="tablist" aria-label="Bracket view">
        {views.map((item) => <button key={item.id} role="tab" aria-selected={view === item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}>{item.label}</button>)}
      </div>
      <div className="bracket-view-content">
        {view === "all" && <FullBracket snapshot={snapshot} />}
        {(view === "winners" || view === "elimination") && <FilteredBracket snapshot={snapshot} view={view} />}
        {view === "finals" && <Finals snapshot={snapshot} />}
      </div>
    </section>
  );
}
