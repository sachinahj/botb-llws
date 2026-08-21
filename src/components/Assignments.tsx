import { managers, teams } from "../data/managers";

export function Assignments() {
  return (
    <section className="content-section">
      <div className="section-heading"><div><p className="eyebrow">Two teams each</p><h2>Manager Assignments</h2></div></div>
      <div className="table-shell assignment-table">
        <table>
          <thead><tr><th>Manager</th><th>U.S. Team</th><th>International Team</th></tr></thead>
          <tbody>
            {managers.map((manager) => {
              const managerTeams = teams.filter((team) => team.manager === manager);
              return <tr key={manager}><td data-label="Manager"><strong>{manager}</strong></td><td data-label="U.S. Team">{managerTeams.find((team) => team.side === "us")?.region}</td><td data-label="International Team">{managerTeams.find((team) => team.side === "international")?.region}</td></tr>;
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
