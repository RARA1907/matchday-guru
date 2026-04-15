const API_SPORTS_BASE_URL = "https://v3.football.api-sports.io";
const BASKETBALL_BASE_URL = "https://v1.basketball.api-sports.io";
const VOLLEYBALL_BASE_URL = "https://v1.volleyball.api-sports.io";

const API_KEY = process.env.API_SPORTS_KEY!;

// Fenerbahçe Team IDs
export const FB_TEAM_IDS = {
  football: 611,
  basketball: 1270,
  volleyball: 1271,
} as const;

export type SportType = keyof typeof FB_TEAM_IDS;

interface ApiSportsResponse<T> {
  get: string;
  parameters: Record<string, unknown>;
  errors: Record<string, unknown>;
  results: number;
  paging: { current: number; total: number };
  response: T;
}

export interface Team {
  id: number;
  name: string;
  code: string;
  country: string;
  founded: number;
  national: boolean;
  logo: string;
}

export interface Venue {
  id: number;
  name: string;
  address: string;
  city: string;
  capacity: number;
  surface: string;
  image: string;
}

export interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  season: number;
}

export interface Game {
  id: number;
  date: string;
  time: string;
  timestamp: number;
  timezone: string;
  week: number;
  status: { long: string; short: string; elapsed: number | null };
  league: League;
  teams: { home: { id: number; name: string; logo: string }; away: { id: number; name: string; logo: string } };
  goals: { home: number | null; away: number | null };
  score: { halftime: { home: number | null; away: number | null }; fulltime: { home: number | null; away: number | null }; extratime: { home: number | null; away: number | null }; penalty: { home: number | null; away: number | null } };
}

export interface StandingTeam {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  played: number;
  win: { total: number; home: number; away: number };
  draw: { total: number; home: number; away: number };
  lose: { total: number; home: number; away: number };
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  form: string;
}

async function fetchApi<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "x-apisports-key": API_KEY },
    next: { revalidate: 300 }, // Cache 5 minutes
  });

  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export async function getFootballFixtures(teamId: number, season: number = 2024): Promise<Game[]> {
  const url = `${API_SPORTS_BASE_URL}/fixtures?team=${teamId}&season=${season}`;
  const data = await fetchApi<ApiSportsResponse<Game[]>>(url);
  return data.response;
}

export async function getFootballStandings(leagueId: number, season: number = 2024): Promise<StandingTeam[]> {
  const url = `${API_SPORTS_BASE_URL}/standings?league=${leagueId}&season=${season}`;
  const data = await fetchApi<ApiSportsResponse<StandingTeam[][]>>(url);
  // API returns array of arrays grouped by group
  return data.response[0] || [];
}

export async function getBasketballFixtures(teamId: number, season: number = 2024): Promise<Game[]> {
  const url = `${BASKETBALL_BASE_URL}/games?team=${teamId}&season=${season}`;
  const data = await fetchApi<ApiSportsResponse<Game[]>>(url);
  return data.response;
}

export async function getVolleyballFixtures(teamId: number, season: number = 2024): Promise<Game[]> {
  const url = `${VOLLEYBALL_BASE_URL}/games?team=${teamId}&season=${season}`;
  const data = await fetchApi<ApiSportsResponse<Game[]>>(url);
  return data.response;
}

export async function getTodayFixtures(branch: SportType = "football") {
  const teamId = FB_TEAM_IDS[branch];
  const today = new Date().toISOString().split("T")[0];

  switch (branch) {
    case "football":
      return getFootballFixtures(teamId);
    case "basketball":
      return getBasketballFixtures(teamId);
    case "volleyball":
      return getVolleyballFixtures(teamId);
    default:
      return [];
  }
}
