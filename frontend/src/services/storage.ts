import type { Terreiro } from "@/types/terreiro";

const KEY = "mapeamento_terreiros_v1";

const SEGMENTO_MAP: Record<string, Terreiro["segmento"]> = {
  "Candombl\u00c3\u00a9": "Candombl\u00e9",
  "Candombl\u00e9": "Candombl\u00e9",
  Umbanda: "Umbanda",
  Jurema: "Jurema",
  "Culto tradicional Iorub\u00c3\u00a1": "Culto tradicional Iorub\u00e1",
  "Culto tradicional Iorub\u00e1": "Culto tradicional Iorub\u00e1",
};

const RACA_COR_MAP: Record<string, Terreiro["racaCor"]> = {
  Preto: "Preto",
  Branco: "Branco",
  Pardo: "Pardo",
  Amarelo: "Amarelo",
  "Ind\u00c3\u00adgena": "Ind\u00edgena",
  "Ind\u00edgena": "Ind\u00edgena",
};

type StoredTerreiro = Omit<Terreiro, "segmento" | "racaCor"> & {
  segmento: string;
  racaCor: string;
};

function normalizeTerreiro(item: StoredTerreiro): Terreiro {
  return {
    ...item,
    segmento: SEGMENTO_MAP[item.segmento] ?? "Umbanda",
    racaCor: RACA_COR_MAP[item.racaCor] ?? "Preto",
  };
}

export function loadTerreiros(): Terreiro[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as StoredTerreiro[];
    if (!Array.isArray(parsed)) return [];

    return parsed.map(normalizeTerreiro);
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
  return list.find((terreiro) => terreiro.id === id) ?? null;
}

export function deleteTerreiroById(id: string) {
  const list = loadTerreiros().filter((terreiro) => terreiro.id !== id);
  saveTerreiros(list);
}
