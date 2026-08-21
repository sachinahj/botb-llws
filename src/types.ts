export type Side = "us" | "international" | "world";
export type GameStatus = "scheduled" | "final";
export type EntrantRef =
  | { kind: "team"; teamId: string }
  | { kind: "winner"; gameId: number }
  | { kind: "loser"; gameId: number };

export type Game = {
  id: number;
  side: Side;
  round: string;
  bracket: "winners" | "elimination" | "championship" | "placement";
  dateTime: string;
  venue: "Lamade" | "Volunteer";
  teamA: EntrantRef;
  teamB: EntrantRef;
  winnerAdvancesTo?: number;
  loserAdvancesTo?: number;
  loserPlacementTier?: number;
  scoreA?: number;
  scoreB?: number;
  status: GameStatus;
};

export type Team = {
  id: string;
  side: Exclude<Side, "world">;
  region: string;
  abbreviation: string;
  manager: string;
};

export type ResolvedGame = Game & {
  resolvedTeamA?: Team;
  resolvedTeamB?: Team;
  winnerId?: string;
  loserId?: string;
};

export type TournamentSnapshot = {
  games: ResolvedGame[];
  teams: Team[];
  records: Record<string, TeamRecord>;
};

export type TeamRecord = {
  wins: number;
  losses: number;
  runsFor: number;
  runsAgainst: number;
  eliminated: boolean;
  championSide?: Side;
  worldChampion: boolean;
  finish: number;
  projectedFinish: number;
  statusLabel: string;
};

export type StandingsOptions = {
  championshipBonus: boolean;
};

export type OfficialGameResult = {
  id: number;
  status: GameStatus;
  teams: Array<{
    teamId?: string;
    name: string;
    score?: number;
  }>;
};

export type OfficialResultsPayload = {
  source: "little-league";
  sourceUrl: string;
  fetchedAt: string;
  games: OfficialGameResult[];
};
