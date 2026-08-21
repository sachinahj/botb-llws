import { useEffect, useMemo, useState } from "react";
import { Brackets, ClipboardList, ListOrdered, Scale } from "lucide-react";
import { Assignments } from "./components/Assignments";
import { Bracket } from "./components/Bracket";
import { Rules } from "./components/Rules";
import { Standings } from "./components/Standings";
import { standingsSettings } from "./data/settings";
import { getTournamentData } from "./lib/results";
import { calculateStandings } from "./lib/standings";
import type { TournamentSnapshot } from "./types";

type Tab = "bracket" | "standings" | "assignments" | "rules";
const tabs = [
  { id: "bracket" as const, label: "Bracket", icon: Brackets },
  { id: "standings" as const, label: "Standings", icon: ListOrdered },
  { id: "assignments" as const, label: "Teams", icon: ClipboardList },
  { id: "rules" as const, label: "Rules", icon: Scale },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("bracket");
  const [snapshot, setSnapshot] = useState<TournamentSnapshot>();
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    getTournamentData().then((data) => {
      setSnapshot(data.snapshot);
      setLastUpdated(data.lastUpdated);
    });
  }, []);

  const standings = useMemo(() => snapshot ? calculateStandings(snapshot, standingsSettings) : [], [snapshot]);

  if (!snapshot) return <main className="loading">Loading tournament...</main>;
  const played = snapshot.games.filter((game) => game.status === "final").length;

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand-lockup">
            <span className="brand-mark">26</span>
            <div><p>Battle of the Best</p><h1>Draft Order Selection (LLWS)</h1></div>
          </div>
          <div className="header-status">
            <span><b>{played}</b> of 38 games final</span>
          </div>
        </div>
      </header>

      <nav className="tab-bar" aria-label="Tournament views">
        <div className="tab-inner">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)} aria-current={tab === id ? "page" : undefined}>
              <Icon size={18} /><span>{label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="main-content">
        <div className="update-line">
          <span>Updated {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(lastUpdated))} ET</span>
        </div>
        {tab === "bracket" && <Bracket snapshot={snapshot} />}
        {tab === "standings" && <Standings rows={standings} snapshot={snapshot} />}
        {tab === "assignments" && <Assignments />}
        {tab === "rules" && <Rules championshipBonus={standingsSettings.championshipBonus} />}
      </main>
    </div>
  );
}
