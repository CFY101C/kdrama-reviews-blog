import type { GenerationRecord, HookResult } from "./types";
import { MAX_HISTORY_SIZE, STORAGE_KEYS } from "./constants";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

export function getHistory(): GenerationRecord[] {
  return read<GenerationRecord[]>(STORAGE_KEYS.history, []);
}

export function addHistory(record: GenerationRecord): void {
  const history = getHistory();
  history.unshift(record);
  if (history.length > MAX_HISTORY_SIZE) {
    history.length = MAX_HISTORY_SIZE;
  }
  write(STORAGE_KEYS.history, history);
}

export function clearHistory(): void {
  write(STORAGE_KEYS.history, []);
}

export function getFavorites(): HookResult[] {
  return read<HookResult[]>(STORAGE_KEYS.favorites, []);
}

export function addFavorite(hook: HookResult): void {
  const favorites = getFavorites();
  if (!favorites.find((f) => f.id === hook.id)) {
    favorites.unshift({ ...hook, isFavorite: true });
    write(STORAGE_KEYS.favorites, favorites);
  }
}

export function removeFavorite(id: string): void {
  const favorites = getFavorites().filter((f) => f.id !== id);
  write(STORAGE_KEYS.favorites, favorites);
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((f) => f.id === id);
}
