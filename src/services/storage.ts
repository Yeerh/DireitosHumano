import type { Terreiro } from "@/types/terreiro";

const KEY = "mapeamento_terreiros_v1";

export function loadTerreiros(): Terreiro[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Terreiro[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveTerreiros(items: Terreiro[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addTerreiro(item: Terreiro) {
  const list = loadTerreiros();
  list.unshift(item);
  saveTerreiros(list);
}

export function getTerreiroById(id: string): Terreiro | null {
  const list = loadTerreiros();
  return list.find((t) => t.id === id) ?? null;
}

export function deleteTerreiroById(id: string) {
  const list = loadTerreiros().filter((t) => t.id !== id);
  saveTerreiros(list);
}
