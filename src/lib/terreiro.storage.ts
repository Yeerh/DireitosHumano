import type { Terreiro } from "./terreiro.types";

const KEY = "portal_terreiros_v1";

export function loadTerreiros(): Terreiro[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Terreiro[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTerreiro(item: Terreiro) {
  const list = loadTerreiros();
  list.unshift(item);
  localStorage.setItem(KEY, JSON.stringify(list));
}
