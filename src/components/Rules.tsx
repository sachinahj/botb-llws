export function Rules({ championshipBonus }: { championshipBonus: boolean }) {
  return (
    <section className="content-section rules">
      <div className="section-heading"><div><p className="eyebrow">How picks are decided</p><h2>Contest Rules</h2></div></div>
      <ol className="rules-list">
        <li><span>01</span><div><strong>Rank each side</strong><p>Every U.S. and International team receives a projected finish from 1 through 10, based primarily on tournament advancement.</p></div></li>
        <li><span>02</span><div><strong>Add both finishes</strong><p>A manager's U.S. finish and International finish are combined. The lowest score receives the earliest fantasy draft pick.</p></div></li>
        <li><span>03</span><div><strong>Apply the champion bonus</strong><p>The overall World Champion's manager receives a one-point reduction. This setting is currently <b>{championshipBonus ? "on" : "off"}</b>.</p></div></li>
        <li><span>04</span><div><strong>Break ties</strong><p>World Champion ownership, best single-team finish, average team winning percentage, average run differential per game, then average runs allowed per game. A coin flip is the final fallback.</p></div></li>
      </ol>
      <p className="rules-note">Standings remain projected until all placement outcomes are known.</p>
    </section>
  );
}
