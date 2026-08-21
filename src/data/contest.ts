export type ContestEntry = {
  fantasyTeam: string;
  manager: string;
  finish: number;
  seed: number;
};

export const contestEntries: ContestEntry[] = [
  { fantasyTeam: "The 6th Jackson", manager: "Ashish", finish: 1, seed: 10 },
  { fantasyTeam: "We DAT!!", manager: "Vishal", finish: 2, seed: 9 },
  { fantasyTeam: "#HustleTime", manager: "Naveed", finish: 3, seed: 8 },
  { fantasyTeam: "#ImWithBell", manager: "Kathan", finish: 4, seed: 7 },
  { fantasyTeam: "BANG BANG", manager: "Mayank", finish: 5, seed: 6 },
  { fantasyTeam: "It Ertz It Hurts", manager: "Milan", finish: 6, seed: 5 },
  { fantasyTeam: "JPow", manager: "Om/Abhi", finish: 7, seed: 4 },
  { fantasyTeam: "Suh Girls One Cup", manager: "Jeet", finish: 8, seed: 3 },
  { fantasyTeam: "Almost Jameis", manager: "Sachin", finish: 9, seed: 2 },
  { fantasyTeam: "Meet my Calf", manager: "Ashwin", finish: 10, seed: 1 },
];
