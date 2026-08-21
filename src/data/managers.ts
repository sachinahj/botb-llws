import type { Team } from "../types";

export const teams: Team[] = [
  { id: "northwest", side: "us", region: "Northwest", abbreviation: "NW", manager: "Ashish" },
  { id: "mountain", side: "us", region: "Mountain", abbreviation: "MTN", manager: "Vishal" },
  { id: "mid-atlantic", side: "us", region: "Mid-Atlantic", abbreviation: "MA", manager: "Naveed" },
  { id: "new-england", side: "us", region: "New England", abbreviation: "NE", manager: "Kathan" },
  { id: "midwest", side: "us", region: "Midwest", abbreviation: "MW", manager: "Mayank" },
  { id: "great-lakes", side: "us", region: "Great Lakes", abbreviation: "GL", manager: "Milan" },
  { id: "metro", side: "us", region: "Metro", abbreviation: "MTR", manager: "Om/Abhi" },
  { id: "southeast", side: "us", region: "Southeast", abbreviation: "SE", manager: "Jeet" },
  { id: "southwest", side: "us", region: "Southwest", abbreviation: "SW", manager: "Sachin" },
  { id: "west", side: "us", region: "West", abbreviation: "W", manager: "Ashwin" },
  { id: "australia", side: "international", region: "Australia", abbreviation: "AUS", manager: "Ashish" },
  { id: "europe-africa", side: "international", region: "Europe-Africa", abbreviation: "EA", manager: "Vishal" },
  { id: "canada", side: "international", region: "Canada", abbreviation: "CAN", manager: "Naveed" },
  { id: "panama", side: "international", region: "Panama", abbreviation: "PAN", manager: "Kathan" },
  { id: "curacao", side: "international", region: "Curacao", abbreviation: "CUW", manager: "Mayank" },
  { id: "mexico", side: "international", region: "Mexico", abbreviation: "MEX", manager: "Milan" },
  { id: "latin-america", side: "international", region: "Latin America", abbreviation: "LA", manager: "Om/Abhi" },
  { id: "japan", side: "international", region: "Japan", abbreviation: "JPN", manager: "Jeet" },
  { id: "caribbean", side: "international", region: "Caribbean", abbreviation: "CB", manager: "Sachin" },
  { id: "asia-pacific", side: "international", region: "Asia-Pacific", abbreviation: "AP", manager: "Ashwin" },
];

export const managers = Array.from(new Set(teams.map((team) => team.manager)));

export function teamLabel(team: Team): string {
  return `${team.region} / ${team.manager}`;
}
