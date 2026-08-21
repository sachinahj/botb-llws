import type { ResolvedGame, Side, TournamentSnapshot } from "../types";
import { GameCard } from "./GameCard";

type Props = { snapshot: TournamentSnapshot };

const roundOrder: Record<Exclude<Side, "world">, string[]> = {
  international: [
    "Opening Round",
    "Winners Round 2",
    "Elimination Round 1",
    "Winners Semifinal",
    "Elimination Round 2",
    "Elimination Round 3",
    "Winners Final",
    "Elimination Final",
    "International Semifinal",
    "International Championship",
  ],
  us: [
    "Opening Round",
    "Winners Round 2",
    "Elimination Round 1",
    "Winners Semifinal",
    "Elimination Round 2",
    "Elimination Round 3",
    "Winners Final",
    "Elimination Final",
    "U.S. Semifinal",
    "U.S. Championship",
  ],
};

function BracketSide({ side, title, games, snapshot }: { side: Exclude<Side, "world">; title: string; games: ResolvedGame[]; snapshot: TournamentSnapshot }) {
  const columns = roundOrder[side]
    .map((round) => ({ round, games: games.filter((game) => game.round === round) }))
    .filter((column) => column.games.length > 0);

  return (
    <section className="bracket-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Double elimination</p>
          <h2>{title}</h2>
        </div>
        <p className="swipe-hint">Swipe to follow the bracket</p>
      </div>
      <div className="bracket-scroll" tabIndex={0} aria-label={`${title} bracket. Scroll horizontally to view all rounds.`}>
        <div className="bracket-grid">
          {columns.map((column) => (
            <div className="round-column" key={column.round}>
              <h3>{column.round}</h3>
              <div className="round-games">
                {column.games.map((game) => <GameCard key={game.id} game={game} snapshot={snapshot} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Bracket({ snapshot }: Props) {
  const international = snapshot.games.filter((game) => game.side === "international");
  const us = snapshot.games.filter((game) => game.side === "us");
  const world = snapshot.games.filter((game) => game.side === "world");

  return (
    <div className="page-stack">
      <BracketSide side="international" title="International Bracket" games={international} snapshot={snapshot} />
      <BracketSide side="us" title="U.S. Bracket" games={us} snapshot={snapshot} />
      <section className="bracket-section finals-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Championship Sunday</p>
            <h2>World Finals</h2>
          </div>
        </div>
        <div className="world-finals">
          {world.map((game) => <GameCard key={game.id} game={game} snapshot={snapshot} />)}
        </div>
      </section>
    </div>
  );
}
