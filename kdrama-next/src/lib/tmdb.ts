const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

function getToken(): string {
  const token = process.env.TMDB_API_KEY;
  if (!token) throw new Error("TMDB_API_KEY not set");
  return token;
}

async function tmdbFetch<T>(path: string, revalidate = 3600): Promise<T> {
  const url = `${TMDB_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
    },
    next: { revalidate },
  });
  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export interface TmdbTvShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  first_air_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  number_of_episodes?: number;
  number_of_seasons?: number;
  created_by?: { name: string }[];
  networks?: { name: string }[];
  origin_country?: string[];
}

interface TmdbPaginated<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbCredit {
  cast: { name: string; character: string; profile_path: string | null }[];
  crew: { name: string; job: string; department: string }[];
}

export interface TmdbImages {
  backdrops: { file_path: string }[];
  posters: { file_path: string }[];
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export function posterUrl(path: string | null, size = "w500"): string {
  if (!path) return "";
  return `${IMAGE_BASE}/${size}${path}`;
}

export function backdropUrl(path: string | null, size = "w1280"): string {
  if (!path) return "";
  return `${IMAGE_BASE}/${size}${path}`;
}

export async function searchDramas(query: string, page = 1) {
  return tmdbFetch<TmdbPaginated<TmdbTvShow>>(
    `/search/tv?query=${encodeURIComponent(query)}&page=${page}&language=zh-CN`
  );
}

export interface TmdbPerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  known_for: (TmdbTvShow & { media_type: string })[];
}

export interface TmdbMultiResult {
  id: number;
  media_type: "tv" | "person" | "movie";
  name?: string;
  title?: string;
  profile_path?: string | null;
  poster_path?: string | null;
  first_air_date?: string;
  vote_average?: number;
  known_for_department?: string;
  known_for?: (TmdbTvShow & { media_type: string })[];
  genre_ids?: number[];
  overview?: string;
  original_name?: string;
}

export async function searchMulti(query: string, page = 1) {
  return tmdbFetch<TmdbPaginated<TmdbMultiResult>>(
    `/search/multi?query=${encodeURIComponent(query)}&page=${page}&language=zh-CN`
  );
}

export function profileUrl(path: string | null, size = "w185"): string {
  if (!path) return "";
  return `${IMAGE_BASE}/${size}${path}`;
}

export interface TmdbPersonDetail {
  id: number;
  name: string;
  profile_path: string | null;
  biography: string;
  birthday: string | null;
  place_of_birth: string | null;
  known_for_department: string;
}

export async function getPersonDetails(personId: number) {
  return tmdbFetch<TmdbPersonDetail>(
    `/person/${personId}?language=zh-CN`
  );
}

export async function getPersonTvCredits(personId: number) {
  return tmdbFetch<{ cast: (TmdbTvShow & { character: string })[] }>(
    `/person/${personId}/tv_credits?language=zh-CN`
  );
}

export async function getTrendingDramas(page = 1) {
  return tmdbFetch<TmdbPaginated<TmdbTvShow>>(
    `/discover/tv?with_origin_country=KR&sort_by=popularity.desc&page=${page}&language=zh-CN`
  );
}

export async function getDramaDetails(tmdbId: number) {
  return tmdbFetch<TmdbTvShow>(
    `/tv/${tmdbId}?language=zh-CN&append_to_response=external_ids`
  );
}

export async function getDramaCredits(tmdbId: number) {
  return tmdbFetch<TmdbCredit>(`/tv/${tmdbId}/credits?language=zh-CN`);
}

export async function getDramaImages(tmdbId: number) {
  return tmdbFetch<TmdbImages>(`/tv/${tmdbId}/images`);
}

export async function getDramasByGenre(genreId: number, page = 1) {
  return tmdbFetch<TmdbPaginated<TmdbTvShow>>(
    `/discover/tv?with_origin_country=KR&with_genres=${genreId}&sort_by=popularity.desc&page=${page}&language=zh-CN`
  );
}

export async function getDramaGenres() {
  return tmdbFetch<{ genres: TmdbGenre[] }>("/genre/tv/list?language=zh-CN");
}

export async function getSimilarDramas(tmdbId: number) {
  return tmdbFetch<TmdbPaginated<TmdbTvShow>>(
    `/tv/${tmdbId}/similar?language=zh-CN`
  );
}

const TMDB_GENRE_MAP: Record<number, string> = {
  18: "剧情", 10759: "动作冒险", 35: "喜剧", 80: "犯罪",
  99: "纪录片", 10751: "家庭", 10762: "儿童", 9648: "悬疑",
  10763: "新闻", 10764: "真人秀", 10765: "科幻", 10766: "肥皂剧",
  10767: "脱口秀", 10768: "战争", 37: "西部",
};

export function mapGenres(genres: { id: number; name: string }[] | number[]): string {
  if (typeof genres[0] === "number") {
    return (genres as number[]).map((id) => TMDB_GENRE_MAP[id] || "").filter(Boolean).join("、");
  }
  return (genres as { name: string }[]).map((g) => g.name).join("、");
}

export function extractYear(show: TmdbTvShow): number {
  if (!show.first_air_date) return 0;
  return new Date(show.first_air_date).getFullYear();
}
