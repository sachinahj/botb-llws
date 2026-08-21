import { Medal } from "lucide-react";
import { teams } from "../data/managers";
import type { ManagerStanding } from "../lib/standings";
import type { TournamentSnapshot } from "../types";

function TeamCell({ teamId, finish, snapshot }: { teamId: string; finish: number; snapshot: TournamentSnapshot }) {
  const team = teams.find((entry) => entry.id === teamId)!;
  const record = snapshot.records[teamId];
  return (
    <div className="standing-team">
      <strong>{team.region}</strong>
      <span>{record.statusLabel}</span>
      <small>Projected #{finish}</small>
    </div>
  );
}

export function Standings({ rows, snapshot }: { rows: ManagerStanding[]; snapshot: TournamentSnapshot }) {
  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Lower score picks earlier</p>
          <h2>Current / Projected Draft Order</h2>
        </div>
      </div>
      <div className="table-shell standings-table">
        <table>
          <thead><tr><th>Pick</th><th>Manager</th><th>U.S. team</th><th>International team</th><th>Score</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.manager}>
                <td data-label="Pick"><span className={`rank-badge rank-${row.rank}`}>{row.rank <= 3 && <Medal size={15} />} {row.rank}</span></td>
                <td data-label="Manager"><strong>{row.manager}</strong>{row.ownsWorldChampion && <small className="champion-note">Champion bonus</small>}</td>
                <td data-label="U.S."><TeamCell teamId={row.usTeamId} finish={row.usFinish} snapshot={snapshot} /></td>
                <td data-label="International"><TeamCell teamId={row.internationalTeamId} finish={row.internationalFinish} snapshot={snapshot} /></td>
                <td data-label="Score"><strong className="combined-score">{row.combinedScore}</strong>{row.combinedScore !== row.rawScore && <small>Raw {row.rawScore}</small>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
