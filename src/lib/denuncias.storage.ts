import type { Denuncia } from "./denuncias";

const KEY = "mapeamento_denuncias_v1";

const TIPO_MAP: Record<string, Denuncia["tipo"]> = {
  "Den\u00c3\u00bancia": "Den\u00fancia",
  "Den\u00fancia": "Den\u00fancia",
  "Sugest\u00c3\u00a3o": "Sugest\u00e3o",
  "Sugest\u00e3o": "Sugest\u00e3o",
};

const CATEGORIA_MAP: Record<string, Denuncia["categoria"]> = {
  "Discrimina\u00c3\u00a7\u00c3\u00a3o / Intoler\u00c3\u00a2ncia religiosa":
    "Discrimina\u00e7\u00e3o / Intoler\u00e2ncia religiosa",
  "Discrimina\u00e7\u00e3o / Intoler\u00e2ncia religiosa": "Discrimina\u00e7\u00e3o / Intoler\u00e2ncia religiosa",
  "Vandalismo / Dano ao patrim\u00c3\u00b4nio": "Vandalismo / Dano ao patrim\u00f4nio",
  "Vandalismo / Dano ao patrim\u00f4nio": "Vandalismo / Dano ao patrim\u00f4nio",
  "Amea\u00c3\u00a7a / Ass\u00c3\u00a9dio": "Amea\u00e7a / Ass\u00e9dio",
  "Amea\u00e7a / Ass\u00e9dio": "Amea\u00e7a / Ass\u00e9dio",
  "Conflito de vizinhan\u00c3\u00a7a": "Conflito de vizinhan\u00e7a",
  "Conflito de vizinhan\u00e7a": "Conflito de vizinhan\u00e7a",
  Outros: "Outros",
};

type StoredDenuncia = Omit<Denuncia, "tipo" | "categoria"> & {
  tipo: string;
  categoria: string;
};

function normalizeDenuncia(item: StoredDenuncia): Denuncia {
  return {
    ...item,
    tipo: TIPO_MAP[item.tipo] ?? "Den\u00fancia",
    categoria: CATEGORIA_MAP[item.categoria] ?? "Outros",
  };
}

export function loadDenuncias(): Denuncia[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as StoredDenuncia[];
    return Array.isArray(parsed) ? parsed.map(normalizeDenuncia) : [];
  } catch {
    return [];
  }
}

export function saveDenuncias(items: Denuncia[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addDenuncia(item: Denuncia) {
  const list = loadDenuncias();
  list.unshift(item);
  saveDenuncias(list);
}
