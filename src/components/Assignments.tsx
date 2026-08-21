import { contestEntries } from "../data/contest";
import { teams } from "../data/managers";
import { preseasonOdds } from "../data/odds";

export function Assignments() {
  const oddsByTeamId = new Map(preseasonOdds.flatMap((row) => [
    [row.usTeamId, row.usOdds] as const,
    [row.internationalTeamId, row.internationalOdds] as const,
  ]));

  return (
    <section className="content-section">
      <div className="section-heading"><div><p className="eyebrow">Draft seed and preseason odds</p><h2>Manager Assignments</h2></div></div>
      <div className="table-shell assignment-table">
        <table>
          <thead><tr><th>Team</th><th>Manager</th><th>Finish</th><th>Seed</th><th>USA</th><th>Odds</th><th>International</th><th>Odds</th></tr></thead>
          <tbody>
            {[...contestEntries].reverse().map((entry) => {
              const usTeam = teams.find((team) => team.manager === entry.manager && team.side === "us");
              const internationalTeam = teams.find((team) => team.manager === entry.manager && team.side === "international");
              if (!usTeam || !internationalTeam) return null;

              return (
                <tr key={entry.manager}>
                  <td data-label="Team"><strong>{entry.fantasyTeam}</strong></td>
                  <td data-label="Manager"><strong>{entry.manager}</strong></td>
                  <td data-label="Finish">{entry.finish}</td>
                  <td data-label="Seed">{entry.seed}</td>
                  <td data-label="USA">{usTeam.region}</td>
                  <td data-label="USA Odds" className="odds">{oddsByTeamId.get(usTeam.id)}</td>
                  <td data-label="International">{internationalTeam.region}</td>
                  <td data-label="International Odds" className="odds">{oddsByTeamId.get(internationalTeam.id)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
