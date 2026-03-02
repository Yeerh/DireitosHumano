import type { VinculoTerreiro } from "@/types/vinculo";

const KEY = "mapeamento_vinculos_v1";

export function loadVinculos(): VinculoTerreiro[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as VinculoTerreiro[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveVinculos(items: VinculoTerreiro[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addVinculo(item: VinculoTerreiro) {
  const list = loadVinculos();
  list.unshift(item);
  saveVinculos(list);
}

export function loadVinculosByTerreiroId(terreiroId: string) {
  return loadVinculos().filter((item) => item.terreiroId === terreiroId);
}
