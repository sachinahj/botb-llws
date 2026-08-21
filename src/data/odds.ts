export type PreseasonOdds = {
  rank: number;
  usTeamId: string;
  usOdds: string;
  internationalTeamId: string;
  internationalOdds: string;
};

export const preseasonOdds: PreseasonOdds[] = [
  { rank: 1, usTeamId: "west", usOdds: "-150", internationalTeamId: "asia-pacific", internationalOdds: "-150" },
  { rank: 2, usTeamId: "southwest", usOdds: "+400", internationalTeamId: "caribbean", internationalOdds: "+350" },
  { rank: 3, usTeamId: "southeast", usOdds: "+600", internationalTeamId: "japan", internationalOdds: "+550" },
  { rank: 4, usTeamId: "metro", usOdds: "+650", internationalTeamId: "latin-america", internationalOdds: "+550" },
  { rank: 5, usTeamId: "great-lakes", usOdds: "+1000", internationalTeamId: "mexico", internationalOdds: "+950" },
  { rank: 6, usTeamId: "midwest", usOdds: "+1400", internationalTeamId: "curacao", internationalOdds: "+1500" },
  { rank: 7, usTeamId: "new-england", usOdds: "+1400", internationalTeamId: "panama", internationalOdds: "+1600" },
  { rank: 8, usTeamId: "mid-atlantic", usOdds: "+1600", internationalTeamId: "canada", internationalOdds: "+2500" },
  { rank: 9, usTeamId: "mountain", usOdds: "+2200", internationalTeamId: "europe-africa", internationalOdds: "+3000" },
  { rank: 10, usTeamId: "northwest", usOdds: "+2200", internationalTeamId: "australia", internationalOdds: "+3500" },
];
